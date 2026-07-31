import { deflateRawSync, inflateRawSync } from "node:zlib";
import { mkdir, open, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { walkFiles } from "./preview-common.mjs";

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1)
    value = (value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1) >>> 0;
  return value;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(date.getUTCFullYear(), 1980);
  return {
    time:
      (date.getUTCHours() << 11) |
      (date.getUTCMinutes() << 5) |
      Math.floor(date.getUTCSeconds() / 2),
    date:
      ((year - 1980) << 9) |
      ((date.getUTCMonth() + 1) << 5) |
      date.getUTCDate(),
  };
}

/** Creates a deterministic deflated ZIP without platform-specific utilities. */
export async function zipDirectory(source, target, timestamp) {
  const output = await open(target, "w");
  const centralRecords = [];
  let offset = 0;
  try {
    for (const file of await walkFiles(source)) {
      const name = path.relative(source, file).replaceAll(path.sep, "/");
      const nameBuffer = Buffer.from(name);
      const content = await readFile(file);
      const compressed = deflateRawSync(content, { level: 9 });
      const crc = crc32(content);
      const { time, date } = dosDateTime(timestamp);
      const header = Buffer.alloc(30);
      header.writeUInt32LE(0x04034b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(0x800, 6);
      header.writeUInt16LE(8, 8);
      header.writeUInt16LE(time, 10);
      header.writeUInt16LE(date, 12);
      header.writeUInt32LE(crc, 14);
      header.writeUInt32LE(compressed.length, 18);
      header.writeUInt32LE(content.length, 22);
      header.writeUInt16LE(nameBuffer.length, 26);
      await output.write(header);
      await output.write(nameBuffer);
      await output.write(compressed);
      centralRecords.push({
        nameBuffer,
        crc,
        compressedSize: compressed.length,
        size: content.length,
        time,
        date,
        offset,
      });
      offset += header.length + nameBuffer.length + compressed.length;
    }
    const centralOffset = offset;
    for (const record of centralRecords) {
      const header = Buffer.alloc(46);
      header.writeUInt32LE(0x02014b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(20, 6);
      header.writeUInt16LE(0x800, 8);
      header.writeUInt16LE(8, 10);
      header.writeUInt16LE(record.time, 12);
      header.writeUInt16LE(record.date, 14);
      header.writeUInt32LE(record.crc, 16);
      header.writeUInt32LE(record.compressedSize, 20);
      header.writeUInt32LE(record.size, 24);
      header.writeUInt16LE(record.nameBuffer.length, 28);
      header.writeUInt32LE(record.offset, 42);
      await output.write(header);
      await output.write(record.nameBuffer);
      offset += header.length + record.nameBuffer.length;
    }
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(centralRecords.length, 8);
    end.writeUInt16LE(centralRecords.length, 10);
    end.writeUInt32LE(offset - centralOffset, 12);
    end.writeUInt32LE(centralOffset, 16);
    await output.write(end);
  } finally {
    await output.close();
  }
}

/** Extracts archives produced above while rejecting path traversal. */
export async function extractZip(archive, destination) {
  const buffer = await readFile(archive);
  let offset = 0;
  while (
    offset + 4 <= buffer.length &&
    buffer.readUInt32LE(offset) === 0x04034b50
  ) {
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const expectedSize = buffer.readUInt32LE(offset + 22);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = buffer
      .subarray(nameStart, nameStart + nameLength)
      .toString("utf8");
    const target = path.resolve(destination, name);
    const relative = path.relative(path.resolve(destination), target);
    if (relative.startsWith("..") || path.isAbsolute(relative))
      throw new Error("PREVIEW_ARTIFACT_INCOMPLETE: unsafe ZIP entry.");
    const dataStart = nameStart + nameLength + extraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const content = method === 8 ? inflateRawSync(compressed) : compressed;
    if (content.length !== expectedSize)
      throw new Error("PREVIEW_CHECKSUM_MISMATCH: ZIP entry size differs.");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    offset = dataStart + compressedSize;
  }
}

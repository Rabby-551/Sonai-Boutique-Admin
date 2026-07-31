"use client";
import { Trash2, Upload } from "lucide-react";
import { useState } from "react";
import type { ProductImage } from "../schemas/catalog";

const validTypes = ["image/jpeg", "image/png", "image/webp"];
export function ImageEditor({
  value,
  onChange,
}: {
  value: ProductImage[];
  onChange: (value: ProductImage[]) => void;
}) {
  const [selectionError, setSelectionError] = useState("");
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const eligible = selected.filter(
      (file) => validTypes.includes(file.type) && file.size <= 5_000_000,
    );
    const accepted = eligible
      .slice(0, 8 - value.length)
      .map((file, index): ProductImage => ({
        id: `img-${crypto.randomUUID()}`,
        name: file.name,
        altText: file.name.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
        mimeType: file.type as ProductImage["mimeType"],
        sizeBytes: file.size,
        position: value.length + index,
        previewUrl: URL.createObjectURL(file),
      }));
    const rejected = selected.length - accepted.length;
    setSelectionError(
      rejected
        ? `${rejected} image${rejected === 1 ? " was" : "s were"} not added. Use JPEG, PNG or WebP files up to 5 MB, with no more than 8 images.`
        : "",
    );
    onChange([...value, ...accepted]);
  };
  const updateAlt = (id: string, altText: string) =>
    onChange(
      value.map((image) => (image.id === id ? { ...image, altText } : image)),
    );
  const persisted = value.map((image) => ({
    ...image,
    previewUrl: image.previewUrl.startsWith("blob:")
      ? "/product-placeholder.svg"
      : image.previewUrl,
  }));
  return (
    <section className="form-section">
      <div className="section-title">
        <div>
          <h2>Product images</h2>
          <p className="metric-label">
            JPEG, PNG or WebP; maximum 5 MB each and 8 images.
          </p>
        </div>
        <label className="button secondary">
          <Upload size={16} />
          Choose images
          <input
            accept="image/jpeg,image/png,image/webp"
            hidden
            multiple
            onChange={(event) => addFiles(event.target.files)}
            type="file"
          />
        </label>
      </div>
      <input name="images" type="hidden" value={JSON.stringify(persisted)} />
      {selectionError && (
        <div className="form-message error" role="alert">
          {selectionError}
        </div>
      )}
      {value.length ? (
        <div className="image-grid">
          {value.map((image) => (
            <article className="image-card" key={image.id}>
              <div
                aria-label={image.altText}
                className="image-preview"
                role="img"
                style={{ backgroundImage: `url(${image.previewUrl})` }}
              />
              <div className="field compact">
                <label htmlFor={`alt-${image.id}`}>Alt text</label>
                <input
                  className="input"
                  id={`alt-${image.id}`}
                  maxLength={125}
                  required
                  value={image.altText}
                  onChange={(event) => updateAlt(image.id, event.target.value)}
                />
              </div>
              <button
                className="button secondary"
                onClick={() =>
                  onChange(value.filter((item) => item.id !== image.id))
                }
                type="button"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-inline">
          No images selected. The catalog remains usable with the Sonai
          placeholder.
        </div>
      )}
    </section>
  );
}

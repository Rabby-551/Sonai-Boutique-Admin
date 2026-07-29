import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageEditor } from "../components/image-editor";

describe("ImageEditor", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:catalog-preview"),
    });
  });

  it("previews allowed metadata and explains rejected files", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ImageEditor value={[]} onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, {
      target: {
        files: [
          new File(["image"], "front-view.png", { type: "image/png" }),
          new File(["document"], "notes.txt", { type: "text/plain" }),
        ],
      },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        altText: "front view",
        mimeType: "image/png",
        previewUrl: "blob:catalog-preview",
      }),
    ]);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "1 image was not added",
    );
  });
});

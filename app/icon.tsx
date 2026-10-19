import { ImageResponse } from "next/og";

export const size = {
  width: 192,
  height: 192
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 88,
          background: "#1F211D",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E2E8D5",
          borderRadius: "40px",
          fontWeight: 700,
          fontFamily: "serif"
        }}
      >
        T
      </div>
    ),
    {
      ...size
    }
  );
}

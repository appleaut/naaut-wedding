
export function hexToOklch(hex: string): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle short hex (e.g. #FFF)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Parse hex
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    if (isNaN(r) || isNaN(g) || isNaN(b)) throw new Error("Invalid Hex");

    // sRGB to Linear sRGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Linear sRGB to XYZ (D65)
    const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

    // XYZ to Oklab
    const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    const l__ = Math.cbrt(l_);
    const m__ = Math.cbrt(m_);
    const s__ = Math.cbrt(s_);

    const L = 0.2104542553 * l__ + 0.7936177850 * m__ - 0.0040720468 * s__;
    const a = 1.9779984951 * l__ - 2.4285922050 * m__ + 0.4505937099 * s__;
    const b_ = 0.0259040371 * l__ + 0.7827717662 * m__ - 0.8086757660 * s__;

    // Oklab to Oklch
    const C = Math.sqrt(a * a + b_ * b_);
    let h = Math.atan2(b_, a) * (180 / Math.PI);

    if (h < 0) h += 360;

    // Return as "L C H" string
    // Ensure L is within 0-1 (it can slightly exceed 1 due to gamut mapping issues but for sRGB inputs it should be fine, or we clamp)
    // Actually L can be > 1 for HDR, but sRGB is SDR.

    return `${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(4)}`;
}

// ? Ported from https://github.com/golang/go/blob/26b5783b72376acd0386f78295e678b9a6bff30e/src/encoding/base64/base64.go#L53-L192
// ? Modifications:
// ?   - Removed logic supporting padding.
// ?   - Hardcoded the Base64 URL alphabet.
// ?   - Use a fixed length pre-allocated destination.
// ?   - Ported to Rust.

const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

pub fn encode(dst: &mut [u8], src: &[u8]) {
    let required_len = (src.len() + 2) / 3 * 4;
    if dst.len() < required_len {
        panic!("destination buffer too small");
    }

    let mut di: usize = 0;
    let mut si: usize = 0;
    let n = (src.len() / 3) * 3;

    while si < n {
        let val = (src[si] as usize) << 16 | (src[si + 1] as usize) << 8 | (src[si + 2] as usize);
        dst[di] = ALPHABET[val >> 18 & 0x3F];
        dst[di + 1] = ALPHABET[val >> 12 & 0x3F];
        dst[di + 2] = ALPHABET[val >> 6 & 0x3F];
        dst[di + 3] = ALPHABET[val & 0x3F];
        si += 3;
        di += 4;
    }

    let remain = src.len() - si;

    if remain == 0 {
        return;
    }

    let mut val = (src[si] as usize) << 16;

    if remain == 2 {
        val |= (src[si + 1] as usize) << 8;
    }

    dst[di] = ALPHABET[val >> 18 & 0x3F];
    dst[di + 1] = ALPHABET[val >> 12 & 0x3F];

    if remain == 2 {
        dst[di + 2] = ALPHABET[val >> 6 & 0x3F];
    }
}

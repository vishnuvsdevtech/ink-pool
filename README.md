# Ink Pool

**Live:** https://vishnuvsdevtech.github.io/ink-pool/

Type that bleeds into paper. Letters wick into paper fibre as the pointer passes. The text stays crisp; only its edges bloom.

**How:** The glyph alpha is rendered once offscreen; each frame a blurred copy is drawn underneath the sharp text, with the blur radius pulsing with wetness. Because the bloom is the glyphs themselves, it can never wander into the margin and read as a smudge.

**What it is not:** No fluid solver and no shader — two blurred draws per frame.

# Specification

## Summary
**Goal:** Fix YouTube video embedding in the BNHS Hymn section so that pasted YouTube links display and play correctly.

**Planned changes:**
- Fix YouTube URL conversion to properly handle standard (youtube.com/watch?v=) and short (youtu.be/) link formats for embedding
- Configure YouTube embed player to enable autoplay with sound after the existing 3-second delay
- Add error handling to display clear messages when videos cannot be embedded due to privacy or embed restrictions

**User-visible outcome:** Administrators can paste YouTube links into the BNHS Hymn external link field, and the videos will display and auto-play correctly on the public BNHS Hymn page.

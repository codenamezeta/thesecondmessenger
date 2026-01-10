
import sys

filename = "src/components/MusicArchive.tsx"
try:
    with open(filename, "rb") as f:
        content = f.read()

    print(f"File size: {len(content)} bytes")
    
    found_issues = False
    for i, byte in enumerate(content):
        # Allow Tab (9), Newline (10), CR (13), and Printable ASCII (32-126)
        if not (byte == 9 or byte == 10 or byte == 13 or (32 <= byte <= 126)):
            print(f"Found weird byte at offset {i}: {byte} ({hex(byte)})")
            # Show context
            start = max(0, i - 10)
            end = min(len(content), i + 10)
            print(f"Context: {content[start:end]}")
            found_issues = True
            
    if not found_issues:
        print("No non-printable/non-ASCII characters found.")

except Exception as e:
    print(f"Error: {e}")

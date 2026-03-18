import { useRef, useState, useEffect, useCallback } from "react";
import { Dialog, Flex, Box, Button, Text, Slider, Badge } from "@radix-ui/themes";

// ─── REWRITTEN — uses a callback ref so the canvas element is guaranteed to
// exist before we attempt to draw, fixing the "brush doesn't load" issue. ───

/**
 * Canvas-based inpainting mask editor.
 * Painted areas (red overlay) → transparent pixels in output PNG (OpenAI "edit this region").
 *
 * Uses a callback ref so the canvas element is guaranteed to exist before image
 * loading begins — this fixes the "brush doesn't load on first open" bug.
 *
 * Props:
 *   open          – boolean
 *   onOpenChange  – (boolean) => void
 *   imageSrc      – URL of the base image to mask over
 *   onMask        – (maskDataUrl: string | null) => void
 */
export default function MaskEditorDialog({ open, onOpenChange, imageSrc, onMask, existingMaskDataUrl }) {
    const [canvasEl, setCanvasEl] = useState(null); // set via callback ref below
    const maskCanvas = useRef(null);                // off-screen mask
    const imgEl = useRef(null);
    const isDrawing = useRef(false);
    const lastPos = useRef(null);
    const [brushSize, setBrushSize] = useState(30);
    const [hasMask, setHasMask] = useState(false);
    const [ready, setReady] = useState(false);

    // Callback ref — fires the instant <canvas> mounts/unmounts (no timing race)
    const canvasRef = useCallback((el) => setCanvasEl(el), []);

    // Load image whenever the canvas element is available or imageSrc changes
    useEffect(() => {
        if (!canvasEl || !imageSrc || !open) return;
        setReady(false);
        setHasMask(false);

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imgEl.current = img;
            canvasEl.width = img.naturalWidth;
            canvasEl.height = img.naturalHeight;
            canvasEl.getContext("2d").drawImage(img, 0, 0);

            const off = document.createElement("canvas");
            off.width = img.naturalWidth;
            off.height = img.naturalHeight;
            maskCanvas.current = off;

            // Restore a previously applied mask
            if (existingMaskDataUrl) {
                const maskImg = new window.Image();
                maskImg.onload = () => {
                    const mCtx = off.getContext("2d");
                    const ctx = canvasEl.getContext("2d");
                    // Rebuild the white mask canvas from the OpenAI format mask:
                    // transparent pixels = inpaint region = white on mask canvas
                    const tmp = document.createElement("canvas");
                    tmp.width = img.naturalWidth; tmp.height = img.naturalHeight;
                    const tCtx = tmp.getContext("2d");
                    tCtx.drawImage(maskImg, 0, 0);
                    const pxData = tCtx.getImageData(0, 0, tmp.width, tmp.height);
                    const restored = mCtx.createImageData(tmp.width, tmp.height);
                    for (let i = 0; i < pxData.data.length; i += 4) {
                        // transparent in OpenAI mask = painted area
                        if (pxData.data[i + 3] === 0) {
                            restored.data[i] = 255; restored.data[i + 1] = 255;
                            restored.data[i + 2] = 255; restored.data[i + 3] = 255;
                        }
                    }
                    mCtx.putImageData(restored, 0, 0);
                    // Draw red overlay on the display canvas
                    for (let i = 0; i < restored.data.length; i += 4) {
                        if (restored.data[i] > 0) {
                            const px = (i / 4);
                            const x = px % tmp.width;
                            const y = Math.floor(px / tmp.width);
                            ctx.fillStyle = "rgba(0,0,0,0.55)";
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                    setHasMask(true);
                    setReady(true);
                };
                maskImg.src = existingMaskDataUrl;
            } else {
                setReady(true);
            }
        };
        img.src = imageSrc;
    }, [canvasEl, imageSrc, open, existingMaskDataUrl]);

    // ─── Drawing ─────────────────────────────────────────────────────────────
    const getPos = useCallback((e) => {
        const rect = canvasEl.getBoundingClientRect();
        const scale = canvasEl.width / rect.width;
        return {
            x: (e.clientX - rect.left) * scale,
            y: (e.clientY - rect.top) * scale,
            r: (brushSize / 2) * scale,
        };
    }, [canvasEl, brushSize]);

    const stroke = useCallback((e) => {
        if (!isDrawing.current || !canvasEl || !maskCanvas.current || !imgEl.current) return;
        const { x, y, r } = getPos(e);
        const ctx = canvasEl.getContext("2d");
        const mCtx = maskCanvas.current.getContext("2d");
        const diameter = r * 2;

        const drawSegment = (context, color) => {
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineWidth = diameter;
            context.strokeStyle = color;
            context.beginPath();
            if (lastPos.current) {
                context.moveTo(lastPos.current.x, lastPos.current.y);
            } else {
                context.moveTo(x, y);
            }
            context.lineTo(x, y);
            context.stroke();
        };

        mCtx.globalCompositeOperation = "source-over";
        drawSegment(mCtx, "white");
        drawSegment(ctx, "rgba(0,0,0,0.55)");

        lastPos.current = { x, y };

        const md = maskCanvas.current.getContext("2d").getImageData(0, 0, maskCanvas.current.width, maskCanvas.current.height).data;
        let any = false;
        for (let i = 3; i < md.length; i += 4) { if (md[i] > 0) { any = true; break; } }
        setHasMask(any);
    }, [canvasEl, getPos]);

    // Attach/detach pointer listeners (only when canvas is ready)
    useEffect(() => {
        if (!canvasEl || !ready) return;
        const onDown = (e) => { isDrawing.current = true; lastPos.current = null; stroke(e); };
        const onMove = (e) => { if (isDrawing.current) stroke(e); };
        const onUp = () => { isDrawing.current = false; lastPos.current = null; };
        const onLeave = () => { isDrawing.current = false; lastPos.current = null; };
        canvasEl.addEventListener("mousedown", onDown);
        canvasEl.addEventListener("mousemove", onMove);
        canvasEl.addEventListener("mouseup", onUp);
        canvasEl.addEventListener("mouseleave", onLeave);
        return () => {
            canvasEl.removeEventListener("mousedown", onDown);
            canvasEl.removeEventListener("mousemove", onMove);
            canvasEl.removeEventListener("mouseup", onUp);
            canvasEl.removeEventListener("mouseleave", onLeave);
        };
    }, [canvasEl, stroke, ready]);

    // ─── Actions ─────────────────────────────────────────────────────────────
    const handleClear = () => {
        if (!canvasEl || !maskCanvas.current || !imgEl.current) return;
        canvasEl.getContext("2d").clearRect(0, 0, canvasEl.width, canvasEl.height);
        canvasEl.getContext("2d").drawImage(imgEl.current, 0, 0);
        maskCanvas.current.getContext("2d").clearRect(0, 0, maskCanvas.current.width, maskCanvas.current.height);
        setHasMask(false);
    };

    const handleApply = () => {
        const mask = maskCanvas.current;
        if (!mask) return;
        const out = document.createElement("canvas");
        out.width = mask.width; out.height = mask.height;
        const outCtx = out.getContext("2d");
        const src = mask.getContext("2d").getImageData(0, 0, mask.width, mask.height);
        const dst = outCtx.createImageData(out.width, out.height);
        for (let i = 0; i < src.data.length; i += 4) {
            // Painted = transparent (OpenAI edits transparent areas); unpainted = opaque black (keep)
            const alpha = src.data[i] > 128 ? 0 : 255;
            dst.data[i] = 0; dst.data[i + 1] = 0; dst.data[i + 2] = 0; dst.data[i + 3] = alpha;
        }
        outCtx.putImageData(dst, 0, 0);
        onMask(out.toDataURL("image/png"));
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="800px">
                <Dialog.Title>Paint Inpaint Mask</Dialog.Title>
                <Dialog.Description size="2" mb="3" color="gray">
                    Paint over the areas you want the AI to regenerate. Blue = will be inpainted.
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    {/* Canvas */}
                    <Box style={{
                        background: "var(--black-a12)", borderRadius: 10, overflow: "hidden",
                        display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200,
                    }}>
                        {!ready && (
                            <Text size="1" color="gray" style={{ padding: 24 }}>Loading image…</Text>
                        )}
                        <canvas
                            ref={canvasRef}
                            style={{
                                maxWidth: "100%", maxHeight: "500px",
                                display: ready ? "block" : "none",
                                cursor: "crosshair",
                            }}
                        />
                    </Box>

                    {/* Controls */}
                    <Flex align="center" gap="3">
                        <Text size="1" color="gray" style={{ whiteSpace: "nowrap" }}>Brush size</Text>
                        <Slider min={6} max={120} value={[brushSize]}
                            onValueChange={([v]) => setBrushSize(v)} style={{ flex: 1 }} />
                        <Text size="1" color="gray" style={{ minWidth: 32 }}>{brushSize}px</Text>
                    </Flex>

                    {/* Actions */}
                    <Flex gap="2" justify="end" align="center">
                        {hasMask && <Badge color="gray" variant="solid">Mask active</Badge>}
                        <Button variant="soft" color="gray" onClick={handleClear} disabled={!ready}>
                            Clear
                        </Button>
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </Dialog.Close>
                        <Button onClick={handleApply} disabled={!hasMask}>
                            Apply Mask
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

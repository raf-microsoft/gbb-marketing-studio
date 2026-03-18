import { Dialog, Flex, Box, Text, Select, Button, Separator } from "@radix-ui/themes";
import useMarketingStudioStore from "../../store/useMarketingStudioStore";

const ACCENT_COLORS = [
    "gray", "gold", "bronze", "brown", "yellow", "amber", "orange", "tomato",
    "red", "ruby", "crimson", "pink", "plum", "purple", "violet", "iris",
    "indigo", "blue", "cyan", "teal", "jade", "green", "grass", "lime", "mint", "sky",
];

const GRAY_COLORS = ["gray", "mauve", "slate", "sage", "olive", "sand"];

const RADIUS_OPTIONS = ["none", "small", "medium", "large", "full"];

export default function ThemeDialog({ open, onOpenChange }) {
    const { accentColor, grayColor, radius, setAccentColor, setGrayColor, setRadius } = useMarketingStudioStore();

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="400px">
                <Dialog.Title>
                    <Flex align="center" gap="2">
                        Theme Settings
                    </Flex>
                </Dialog.Title>
                <Dialog.Description size="2" color="gray" mb="4">
                    Customise the look of Marketing Studio.
                </Dialog.Description>

                <Separator size="4" mb="4" />

                <Flex direction="column" gap="4">
                    {/* Accent colour */}
                    <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">Accent colour</Text>
                        <Select.Root value={accentColor} onValueChange={setAccentColor}>
                            <Select.Trigger />
                            <Select.Content>
                                {ACCENT_COLORS.map((color) => (
                                    <Select.Item key={color} value={color}>
                                        <Flex align="center" gap="2">
                                            <Box
                                                width="12px"
                                                height="12px"
                                                style={{
                                                    borderRadius: "50%",
                                                    backgroundColor: `var(--${color}-9)`,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {color.charAt(0).toUpperCase() + color.slice(1)}
                                        </Flex>
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                    {/* Gray scale */}
                    <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">Gray scale</Text>
                        <Select.Root value={grayColor} onValueChange={setGrayColor}>
                            <Select.Trigger />
                            <Select.Content>
                                {GRAY_COLORS.map((color) => (
                                    <Select.Item key={color} value={color}>
                                        {color.charAt(0).toUpperCase() + color.slice(1)}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                    {/* Radius */}
                    <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">Radius</Text>
                        <Select.Root value={radius} onValueChange={setRadius}>
                            <Select.Trigger />
                            <Select.Content>
                                {RADIUS_OPTIONS.map((r) => (
                                    <Select.Item key={r} value={r}>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Flex>
                </Flex>

                <Flex justify="end" mt="5">
                    <Dialog.Close>
                        <Button variant="soft">Done</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

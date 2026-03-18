import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import {
    IconHome,
    IconPhoto,
    IconVideo,
    IconStack2,
} from "@tabler/icons-react";
import { Text, Avatar, Flex, Box, Heading } from "@radix-ui/themes";
import ThemeDialog from "./dialogs/ThemeDialog";

const navItems = [
    { label: "Home", icon: IconHome, href: "/" },
    { label: "Image", icon: IconPhoto, href: "/image" },
    { label: "Video", icon: IconVideo, href: "/video" },
    { label: "Assets", icon: IconStack2, href: "/assets" },
];

export default function Layout({ children, aside }) {
    const router = useRouter();
    const [themeOpen, setThemeOpen] = useState(false);

    return (
        <Flex direction="column" className="h-screen overflow-hidden bg-gray-50">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
                <Flex align="center" gap="2">
                    <Image src="/logo.svg" alt="Zava" width={80} height={28} priority />
                    <Heading size="4" weight="bold">marketing studio</Heading>
                </Flex>
                <Flex align="center" gap="2">
                    <Text size="2" color="gray">
                        Raf Zavastos
                    </Text>
                    <button
                        onClick={() => setThemeOpen(true)}
                        className="cursor-pointer bg-transparent border-0 p-0"
                    >
                        <Avatar size="2" radius="full" fallback="RZ" />
                    </button>
                </Flex>
            </header>
            <ThemeDialog open={themeOpen} onOpenChange={setThemeOpen} />

            <Flex className="flex-1 overflow-hidden">
                {/* Sidebar */}
                <nav className="flex flex-col items-center py-3 gap-1 bg-white border-r border-gray-200 w-[62px] shrink-0">
                    {navItems.map(({ label, icon: Icon, href }) => {
                        const active = router.pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex flex-col items-center gap-1 py-1 w-full no-underline"
                            >
                                <Flex
                                    align="center" justify="center"
                                    className="w-6 h-6"
                                >
                                    <Icon size={20} className={`${active ? "accent" : "text-gray-600"}`} />
                                </Flex>
                                <Text
                                    size="1"
                                    weight="medium"
                                    className={active ? "accent" : ""}
                                    color={active ? undefined : "gray"}
                                >
                                    {label}
                                </Text>
                            </Link>
                        );
                    })}
                </nav>

                {/* Main content */}
                {aside}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </Flex>
        </Flex>
    );
}

import { Dialog, Button, Flex, Text } from "@radix-ui/themes";

export default function DeleteAssetDialog({ open, onOpenChange, onConfirm, count = 1 }) {
    const isMultiple = count > 1;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Confirm Deletion</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    {isMultiple ? (
                        <>
                            Are you sure you want to delete {count} assets?
                            <br /><br />
                            <Text weight="bold" color="red">Warning:</Text> The asset library is shared across all users.
                            Deleting these assets will also remove them for everyone.
                        </>
                    ) : (
                        <>
                            Are you sure you want to delete this asset?
                            <br /><br />
                            <Text weight="bold" color="red">Warning:</Text> The asset library is shared across all users.
                            Deleting this asset will also remove it for everyone.
                        </>
                    )}
                </Dialog.Description>
                <Flex gap="3" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button color="red" onClick={onConfirm}>
                        Delete
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

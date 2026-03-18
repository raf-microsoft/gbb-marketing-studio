import Image from 'next/image';
import { Link, Flex, Box } from '@radix-ui/themes';

const Footer = () => {
    const contacts = [
        { name: 'Rafal Rutyna', email: 'rafal.rutyna@microsoft.com' }
    ];

    return (
        <Flex className="flex flex-col items-center" direction="column" align="center" justify="center">
            <Box className="mb-4 z-1 backdrop-blur-sm px-2 rounded-xl" mx="4">
                Created by{' '}
                {contacts.map((contact, index) => (
                    <span key={index}>
                        <Link href={`mailto:${contact.name}<${contact.email}>?subject=BPMN Process Automation`}>
                            {contact.name}
                        </Link>
                        {index < contacts.length - 1 && ', '}
                    </span>
                ))}
            </Box>
            <Image
                src="/assets/microsoft-logo.svg"
                alt="Microsoft"
                width="120"
                height="40"
            />
        </Flex>
    );
};

export default Footer;
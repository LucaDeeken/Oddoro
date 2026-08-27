"use client";

import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";


export default function GroupsPage() {
    const router = useRouter();

    return (
        <main className={styles.main}>
            <Container size="sm" py="xl">
                <Title mb="xl" className={styles.header}>Meine Gruppen</Title>

                <Paper withBorder shadow="sm" p="lg" radius="md">
                    <Stack>
                        <Text>
                            Gruppen hier.
                        </Text>

                        <Button onClick={() => router.push("/groups/create")}>
                            + Neue Gruppe erstellen
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </main>
    );
}
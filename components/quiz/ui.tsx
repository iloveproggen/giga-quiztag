import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';

type FrameButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary';
  active?: boolean;
  size?: 'default' | 'compact' | 'large';
};

type StatusPillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'dark';

export function FrameButton({
  variant = 'primary',
  active = false,
  size = 'default',
  className = '',
  type = 'button',
  children,
  ...props
}: FrameButtonProps) {
  const buttonVariant = variant === 'primary' ? 'filled' : 'default';
  const buttonColor =
    variant === 'primary' ? 'dark' : active ? 'gray' : 'gray';
  const buttonSize =
    size === 'compact' ? 'xs' : size === 'large' ? 'md' : 'sm';

  return (
    <Button
      type={type}
      variant={buttonVariant}
      color={buttonColor}
      radius="xl"
      size={buttonSize}
      className={className}
      styles={{
        root: {
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
          borderColor: active ? '#94a3b8' : undefined,
          backgroundColor: active && variant !== 'primary' ? '#e2e8f0' : undefined,
          color: active && variant !== 'primary' ? '#0f172a' : undefined,
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: StatusPillTone;
  className?: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'ui-pill-success'
      : tone === 'warning'
        ? 'ui-pill-warning'
        : tone === 'danger'
          ? 'ui-pill-danger'
          : tone === 'dark'
            ? 'ui-pill-dark'
            : 'ui-pill-neutral';

  return <span className={`ui-pill ${toneClass} ${className}`}>{children}</span>;
}

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <Paper withBorder radius="xl" p="md">
      <Text size="xs" fw={600} tt="uppercase" c="dimmed">
        {label}
      </Text>
      <Text mt="xs" fz="1.875rem" fw={700} c="dark">
        {value}
      </Text>
      {helper ? (
        <Text mt="xs" size="sm" c="dimmed">
          {helper}
        </Text>
      ) : null}
    </Paper>
  );
}

export function TeamAvatar({
  color,
  label,
  size = 'default',
}: {
  color?: string;
  label: string;
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClass =
    size === 'small'
      ? 'h-9 w-9 text-sm'
      : size === 'large'
        ? 'h-16 w-16 text-2xl'
        : 'h-12 w-12 text-lg';

  return (
    <Avatar
      radius="lg"
      className={sizeClass}
      styles={{
        root: {
          backgroundColor: color ?? '#e5e7eb',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          fontWeight: 700,
        },
        placeholder: {
          color: '#0f172a',
          fontWeight: 700,
        },
      }}
    >
      {label}
    </Avatar>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  bodyStyle,
  bodyClassName = '',
  sticker,
  actions,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bodyStyle?: CSSProperties;
  bodyClassName?: string;
  sticker?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card withBorder radius="xl" padding={0} className={className}>
      <Card.Section withBorder inheritPadding py="md" bg="gray.0">
        <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
          <Stack gap={2}>
            <Text size="sm" fw={600} tt="uppercase" c="dark">
              {title}
            </Text>
            {subtitle ? (
              <Text size="sm" c="dimmed">
                {subtitle}
              </Text>
            ) : null}
          </Stack>

          <Group gap="xs" wrap="wrap">
            {actions}
            {sticker ? <StatusPill>{sticker}</StatusPill> : null}
          </Group>
        </Group>
      </Card.Section>

      <Box p="md" className={bodyClassName} style={bodyStyle}>
        {children}
      </Box>
    </Card>
  );
}

export function HydrationPlaceholder({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Center className="mx-auto max-w-4xl">
        <Paper
          withBorder
          radius="xl"
          p="xl"
          className="flex min-h-[320px] w-full flex-col items-center justify-center text-center"
        >
          <Stack align="center" gap="md">
            <StatusPill tone="dark">Sync laeuft</StatusPill>
            <Stack gap="xs" align="center">
              <Title order={1} c="dark">
                {title}
              </Title>
              <Text maw={720} size="lg" c="dimmed">
                {message}
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Center>
    </div>
  );
}

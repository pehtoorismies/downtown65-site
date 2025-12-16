import { Button, Group, Modal } from '@mantine/core'
import { IconCircleOff, IconCircleX } from '@tabler/icons-react'
import { Form } from 'react-router'

interface Props {
  opened: boolean
  onClose: () => void
}

export const CancelModal = ({ opened, onClose }: Props) => {
  return (
    <Modal
      zIndex={2000}
      opened={opened}
      onClose={onClose}
      title="Keskeytä tapahtuman luonti"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Group
        justify="space-between"
        mt={50}
        data-testid="confirmation-modal-content"
      >
        <Button
          onClick={onClose}
          leftSection={<IconCircleX size={18} />}
          data-testid="modal-close"
        >
          Sulje
        </Button>
        <Form method="GET" action="/events">
          <Button
            type="submit"
            color="red"
            rightSection={<IconCircleOff size={18} />}
            data-testid="modal-cancel-event-creation"
          >
            Keskeytä
          </Button>
        </Form>
      </Group>
    </Modal>
  )
}

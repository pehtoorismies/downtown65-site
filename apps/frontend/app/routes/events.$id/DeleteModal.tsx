import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Text,
  TextInput,
  Typography,
} from '@mantine/core'
import { IconCircleOff, IconCircleX } from '@tabler/icons-react'
import { type ChangeEvent, useState } from 'react'
import { Form, useNavigation } from 'react-router'

interface DeleteModalProps {
  opened: boolean
  onCloseModal: () => void
  eventTitle: string
}

export const DeleteModal = ({
  opened,
  onCloseModal,
  eventTitle,
}: DeleteModalProps) => {
  const [formValue, setFormValue] = useState('')
  const navigation = useNavigation()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValue(event.target.value)
  }

  return (
    <Modal
      zIndex={2000}
      opened={opened}
      onClose={onCloseModal}
      title="Tapahtuman poisto"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <LoadingOverlay
        visible={navigation.state === 'submitting'}
        // TODO: below
        //transitionDuration={200}
      />
      <Typography my="sm" data-testid="delete-confirmation-modal-content">
        <p>
          Varmista tapahtuman <strong>{eventTitle}</strong> poisto. Kirjoita
          allaolevaan kenttään <i>poista</i> ja klikkaa Poista.
        </p>
      </Typography>
      <Form method="delete">
        <TextInput
          placeholder="poista"
          label="Kirjoita 'poista'"
          value={formValue}
          onChange={handleChange}
        />
        <Text mt="sm">
          Voit peruuttaa poiston sulkemalla dialogin tai klikkaamalla Peruuta.
        </Text>
        <Group justify="space-between" mt="lg">
          <Button
            onClick={onCloseModal}
            leftSection={<IconCircleX size={18} />}
            data-testid="modal-close"
          >
            Peruuta
          </Button>
          <Button
            type="submit"
            color="red"
            disabled={formValue !== 'poista'}
            rightSection={<IconCircleOff size={18} />}
            data-testid="confirm-delete"
          >
            Poista
          </Button>
        </Group>
      </Form>
    </Modal>
  )
}

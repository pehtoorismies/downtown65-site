import { Box } from '@mantine/core'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import type { ReducerProps } from '../reducer'
import { NextButton, PreviousButton, StepLayout } from './LayoutSteps'

export const StepDescription = ({ state, dispatch }: ReducerProps) => {
  const editor = useEditor({
    autofocus: true,
    content: state.description,
    editable: true,
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      const description = editor.getHTML()
      dispatch({
        description,
        kind: 'description',
      })
    },
  })

  const previousButton = (
    <PreviousButton onClick={() => dispatch({ kind: 'previousStep' })}>
      Kellonaika
    </PreviousButton>
  )
  const nextButton = (
    <NextButton onClick={() => dispatch({ kind: 'nextStep' })}>
      Esikatselu
    </NextButton>
  )

  return (
    <StepLayout
      nextButton={nextButton}
      prevButton={previousButton}
      title="Vapaa kuvaus"
    >
      <Box style={{ minHeight: '300px' }}>
        <RichTextEditor editor={editor} id="rte">
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
      </Box>
    </StepLayout>
  )
}

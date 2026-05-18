'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Node, mergeAttributes } from '@tiptap/core'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Link2 as LinkIcon2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Video,
  Minus,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/utils'

function getVideoEmbedUrl(url: string): string {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-src]',
        getAttrs: el => ({
          src: (el as HTMLElement).getAttribute('data-video-src'),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src } = HTMLAttributes
    if (!src) return ['div', {}]
    return [
      'div',
      {
        'data-video-src': src,
        style: 'position:relative;width:100%;aspect-ratio:16/9;margin-bottom:1rem;border-radius:0.5rem;overflow:hidden;background:#000;',
      },
      [
        'iframe',
        {
          src,
          frameborder: '0',
          allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          style: 'position:absolute;top:0;left:0;width:100%;height:100%;',
        },
      ],
    ]
  },
})

const LinkedImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      linkHref: {
        default: null,
        parseHTML: el => {
          if (el.tagName === 'A') return el.getAttribute('href')
          const anchor = (el as HTMLElement).closest('a')
          return anchor?.getAttribute('href') || null
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a',
        getAttrs: el => {
          const anchor = el as HTMLAnchorElement
          const img = anchor.querySelector('img')
          if (!img) return false
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
          }
        },
      },
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { linkHref, ...imgAttrs } = HTMLAttributes
    if (linkHref) {
      return ['a', { href: linkHref, target: '_blank', rel: 'noopener noreferrer' }, ['img', mergeAttributes(imgAttrs)]]
    }
    return ['img', mergeAttributes(imgAttrs)]
  },
})

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder = 'Comece a escrever...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkedImage,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      VideoExtension,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const [showImagePicker, setShowImagePicker] = useState(false)
  const [images, setImages] = useState<{ name: string; url: string }[]>([])
  const [imageLoading, setImageLoading] = useState(false)

  useEffect(() => {
    if (showImagePicker) {
      setImageLoading(true)
      fetch('/api/imagens')
        .then(res => res.json())
        .then(data => {
          setImages(data.images || [])
          setImageLoading(false)
        })
        .catch(() => setImageLoading(false))
    }
  }, [showImagePicker])

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
    title,
  }: {
    onClick: () => void
    active?: boolean
    icon: React.ElementType
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        active
          ? 'bg-primary-500/20 text-primary-400'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  const addImage = () => {
    setShowImagePicker(true)
  }

  const insertImage = (url: string) => {
    const imageNode = editor.schema.nodes.image.create({ src: url })
    editor.chain().focus().insertContentAt(editor.state.selection.from, imageNode).run()
    setShowImagePicker(false)
  }

  const addVideo = () => {
    const url = window.prompt('URL do vídeo (YouTube, Vimeo ou link direto):')
    if (!url) return
    editor.chain().focus().insertContent({
      type: 'video',
      attrs: { src: getVideoEmbedUrl(url) },
    }).run()
  }

  const addTextLink = () => {
    const url = window.prompt('URL do link:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addImageLink = () => {
    const { state } = editor
    const { selection } = state

    const node = (selection as any).node
    if (!node || node.type.name !== 'image') {
      if (!editor.isActive('image')) return
    }

    const currentNode = node || state.doc.nodeAt(selection.from)
    if (!currentNode || currentNode.type.name !== 'image') return

    const currentHref = currentNode.attrs.linkHref || ''
    const url = window.prompt('URL do link para a imagem:', currentHref)
    if (url === null) return

    const pos = node ? selection.$from.pos : selection.from

    editor
      .chain()
      .focus()
      .command(({ tr, dispatch }) => {
        tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, linkHref: url || null })
        if (dispatch) dispatch(tr)
        return true
      })
      .run()
  }

  const isImageSelected = (editor.state.selection as any).node?.type?.name === 'image' || editor.isActive('image')

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-surface-light">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/5 flex-wrap">
        <div className="flex items-center gap-1 pr-2 border-r border-white/5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={Bold}
            title="Negrito"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={Italic}
            title="Itálico"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            icon={UnderlineIcon}
            title="Sublinhado"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            icon={Strikethrough}
            title="Tachado"
          />
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-white/5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title="Título 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title="Título 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            title="Título 3"
          />
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-white/5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={List}
            title="Lista"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={ListOrdered}
            title="Lista Numerada"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            icon={Quote}
            title="Citação"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            icon={Code}
            title="Código"
          />
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-white/5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            icon={AlignLeft}
            title="Alinhar Esquerda"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            icon={AlignCenter}
            title="Centralizar"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            icon={AlignRight}
            title="Alinhar Direita"
          />
        </div>

        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton onClick={addImage} icon={ImageIcon} title="Inserir Imagem da pasta imagens/" />
          <ToolbarButton onClick={addImageLink} icon={LinkIcon2} title="Adicionar link na imagem selecionada" active={isImageSelected} />
          <ToolbarButton onClick={addVideo} icon={Video} title="Inserir Vídeo" />
        </div>
        <div className="flex items-center gap-1 pl-2 border-l border-white/5">
          <ToolbarButton onClick={addTextLink} icon={LinkIcon} title="Inserir link no texto" />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            title="Desfazer"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            title="Refazer"
          />
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="prose prose-invert max-w-none" />

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowImagePicker(false)}
        >
          <div
            className="bg-surface border border-white/5 rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Selecionar Imagem</h3>
              <button
                onClick={() => setShowImagePicker(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {imageLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">Nenhuma imagem encontrada</p>
                <p className="text-sm text-gray-600">
                  Adicione imagens na pasta <code className="bg-surface-light px-1.5 py-0.5 rounded text-xs">imagens/</code> na raiz do projeto
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map(img => (
                  <button
                    key={img.name}
                    onClick={() => insertImage(img.url)}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-surface-light hover:border-primary-500/50 transition-all duration-200"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs text-white truncate">{img.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAppData } from '../../context/AppDataContext'
import { useNotifications } from '../../context/NotificationContext'
import { CareTemplateSheet } from './CareTemplateSheet'

export function CareTemplateSettings() {
  const { clients, listCareTemplates, deleteCareTemplate } = useAppData()
  const { pushToast } = useNotifications()
  const [editor, setEditor] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const templates = listCareTemplates()

  function handleDelete(template) {
    try {
      deleteCareTemplate(template.id)
      pushToast({
        title: 'Pauta borrada',
        message: `Se ha eliminado “${template.name}”.`,
        tone: 'success'
      })
      setConfirmDelete(null)
    } catch (error) {
      pushToast({
        title: 'No se pudo borrar',
        message: error.message,
        tone: 'warning'
      })
    }
  }

  return (
    <Card className="p-4 lg:col-span-2">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-clay" />
            <h3 className="font-display text-xl leading-none text-coffee">Pautas de curación</h3>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-coffee-soft">
            Crea cuidados reutilizables y asígnalos desde el plan de cada cliente.
          </p>
        </div>
        <Button size="sm" variant="cream" onClick={() => setEditor({ template: null })}>
          <Plus className="h-3.5 w-3.5" />
          Nueva
        </Button>
      </div>

      {templates.length ? (
        <ul className="space-y-2">
          {templates.map((template) => {
            const usage = clients.filter((client) => client.technique === template.id).length
            return (
              <li
                key={template.id}
                className="flex items-center gap-2 rounded-2xl border border-coffee/10 bg-cream-soft/70 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-coffee">{template.name}</p>
                  <p className="mt-0.5 text-[0.68rem] text-coffee-soft">
                    {template.taskIds.length} tareas · {usage}{' '}
                    {usage === 1 ? 'cliente asignado' : 'clientes asignados'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="cream"
                  onClick={() => setEditor({ template })}
                  aria-label={`Editar ${template.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {confirmDelete?.id === template.id ? (
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(template)}>
                      Borrar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={usage > 0}
                    title={usage > 0 ? 'Quita la pauta de sus clientes antes de borrarla' : undefined}
                    onClick={() => setConfirmDelete(template)}
                    aria-label={`Borrar ${template.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="rounded-2xl bg-cream-soft px-3 py-4 text-center text-xs leading-relaxed text-coffee-soft">
          Todavía no hay pautas del estudio. Las pautas estándar siguen disponibles para todos los
          clientes.
        </p>
      )}

      <CareTemplateSheet
        open={Boolean(editor)}
        template={editor?.template || null}
        onClose={() => setEditor(null)}
      />
    </Card>
  )
}

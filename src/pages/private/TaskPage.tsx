import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardActions, CardContent, Chip,
  CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, IconButton, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { createTask, deleteTask, getTasks, patchTask, updateTask } from '../../services/task.service';
import type { Task } from '../../models';

export const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [creating, setCreating] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTask_, setDeleteTask_] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      const data = res.data;
      setTasks(Array.isArray(data) ? data : (data as any).tasks ?? (data as any).data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async () => {
    if (!newTaskName.trim()) return;
    setCreating(true);
    try {
      await createTask({ name: newTaskName.trim() });
      setNewTaskName('');
      await fetchTasks();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleDone = async (task: Task) => {
    try {
      await patchTask(task.id, { done: !task.done });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditOpen = (task: Task) => {
    setEditTask(task);
    setEditName(task.name);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editTask || !editName.trim()) return;
    try {
      await updateTask(editTask.id, { name: editName.trim() });
      setEditOpen(false);
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOpen = (task: Task) => {
    setDeleteTask_(task);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTask_) return;
    try {
      await deleteTask(deleteTask_.id);
      setDeleteOpen(false);
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Mis Tareas
      </Typography>

      {/* Formulario crear tarea */}
      <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Nueva tarea..."
          value={newTaskName}
          onChange={e => setNewTaskName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={creating || !newTaskName.trim()}
        >
          Agregar
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tareas pendientes */}
          <Typography variant="subtitle1" fontWeight={500} mb={1}>
            Pendientes ({pending.length})
          </Typography>
          {pending.length === 0 && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              No hay tareas pendientes
            </Typography>
          )}
          {pending.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggleDone}
              onEdit={handleEditOpen}
              onDelete={handleDeleteOpen}
            />
          ))}

          <Divider sx={{ my: 3 }} />

          {/* Tareas finalizadas */}
          <Typography variant="subtitle1" fontWeight={500} mb={1}>
            Finalizadas ({done.length})
          </Typography>
          {done.length === 0 && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              No hay tareas finalizadas
            </Typography>
          )}
          {done.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggleDone}
              onEdit={handleEditOpen}
              onDelete={handleDeleteOpen}
            />
          ))}
        </>
      )}

      {/* Dialog editar */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar tarea</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            label="Nombre de la tarea"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEditSave()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={!editName.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Eliminar tarea</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que querés eliminar <strong>"{deleteTask_?.name}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskCard = ({ task, onToggle, onEdit, onDelete }: TaskCardProps) => (
  <Card
    sx={{
      mb: 1.5,
      borderLeft: 4,
      borderColor: task.done ? 'success.main' : 'primary.main',
      opacity: task.done ? 0.75 : 1,
      transition: 'all 0.2s',
    }}
  >
    <CardContent sx={{ pb: 0, pt: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => onToggle(task)} color={task.done ? 'success' : 'default'}>
          {task.done ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
        </IconButton>
        <Typography
          variant="body1"
          sx={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'text.secondary' : 'text.primary' }}
        >
          {task.name}
        </Typography>
        <Chip
          label={task.done ? 'Finalizada' : 'Pendiente'}
          size="small"
          color={task.done ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>
    </CardContent>
    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
      <IconButton size="small" onClick={() => onEdit(task)} disabled={task.done}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" color="error" onClick={() => onDelete(task)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </CardActions>
  </Card>
);
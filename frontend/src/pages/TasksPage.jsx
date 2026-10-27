import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { employeesApi, tasksApi } from '../api/services';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';

/**
 * Owner/Manager task board: create, list, verify (approve/reject + rating).
 */
export default function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
  });
  const [verify, setVerify] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([tasksApi.list(), employeesApi.workers().catch(() => ({ data: [] }))])
      .then(([taskRes, workerRes]) => {
        setTasks(taskRes.data.results || taskRes.data);
        const w = workerRes.data.results || workerRes.data || [];
        setWorkers(Array.isArray(w) ? w : []);
      })
      .catch(() => setError(t('tasks.failedLoad')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await tasksApi.create({
        ...form,
        assigned_to: Number(form.assigned_to),
        due_date: form.due_date || null,
      });
      setForm({ title: '', description: '', assigned_to: '', due_date: '' });
      load();
    } catch (err) {
      setError(
        err.response?.data?.assigned_to?.[0] ||
          err.response?.data?.title?.[0] ||
          t('tasks.createFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  const onVerify = async (taskId, decision) => {
    const state = verify[taskId] || {};
    setError('');
    try {
      await tasksApi.verify(taskId, {
        decision,
        rating: state.rating,
        owner_feedback: state.feedback || '',
      });
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.rating?.[0] ||
          data?.owner_feedback?.[0] ||
          data?.detail ||
          t('tasks.verificationFailed')
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-950">{t('tasks.title')}</h1>
        <p className="mt-1 text-ink-500">{t('tasks.subtitle')}</p>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {String(error)}
        </p>
      )}

      <form
        onSubmit={onCreate}
        className="fm-panel grid gap-3 p-5 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t('tasks.assignNewTask')}
        </h2>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-ink-700">{t('tasks.taskTitle')}</span>
          <input
            required
            className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
            value={form.title}
            onChange={set('title')}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-ink-700">{t('tasks.description')}</span>
          <textarea
            rows={2}
            className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
            value={form.description}
            onChange={set('description')}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('tasks.assignTo')}</span>
          <select
            required
            className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
            value={form.assigned_to}
            onChange={set('assigned_to')}
          >
            <option value="">{t('tasks.selectWorker')}</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.username}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('tasks.dueDate')}</span>
          <input
            type="date"
            className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
            value={form.due_date}
            onChange={set('due_date')}
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="fm-btn fm-btn-primary disabled:opacity-60"
          >
            {saving ? t('tasks.creating') : t('tasks.createTask')}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="fm-panel p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-brand-950">{task.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">
                    {t('tasks.assignedTo', { name: task.assigned_to_name })}
                    {task.due_date
                      ? ` · ${t('tasks.due', { date: task.due_date })}`
                      : ''}
                  </p>
                  {task.description && (
                    <p className="mt-2 text-sm">{task.description}</p>
                  )}
                  {task.worker_notes && (
                    <p className="mt-2 text-sm text-ink-700">
                      {t('tasks.workerNotes')}: {task.worker_notes}
                    </p>
                  )}
                </div>
                <StatusBadge status={task.status} />
              </div>

              {task.rating && (
                <div className="mt-2">
                  <StarRating value={task.rating} readOnly />
                </div>
              )}
              {task.owner_feedback && (
                <p className="mt-2 text-sm text-ink-500">
                  Feedback: {task.owner_feedback}
                </p>
              )}

              {task.status === 'COMPLETED' && (
                <div className="mt-4 space-y-3 border-t border-brand-900/10 pt-4">
                  <p className="text-sm font-medium text-brand-950">
                    {t('tasks.verifyCompleted')}
                  </p>
                  <StarRating
                    value={verify[task.id]?.rating || 0}
                    onChange={(rating) =>
                      setVerify((v) => ({
                        ...v,
                        [task.id]: { ...v[task.id], rating },
                      }))
                    }
                  />
                  <textarea
                    rows={2}
                    placeholder={t('tasks.feedbackPlaceholder')}
                    className="fm-input text-sm"
                    value={verify[task.id]?.feedback || ''}
                    onChange={(e) =>
                      setVerify((v) => ({
                        ...v,
                        [task.id]: { ...v[task.id], feedback: e.target.value },
                      }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onVerify(task.id, 'APPROVED')}
                      className="fm-btn fm-btn-primary"
                    >
                      {t('tasks.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onVerify(task.id, 'REJECTED')}
                      className="fm-btn fm-btn-ghost text-rose-800"
                    >
                      {t('tasks.reject')}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

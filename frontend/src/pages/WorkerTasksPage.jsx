import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { tasksApi } from '../api/services';

import StatusBadge from '../components/StatusBadge';

import StarRating from '../components/StarRating';

import PageHeader from '../components/PageHeader';



export default function WorkerTasksPage() {

  const { t } = useTranslation();

  const [tasks, setTasks] = useState([]);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState({});

  const [busyId, setBusyId] = useState(null);



  const load = () => {

    setLoading(true);

    tasksApi

      .list()

      .then(({ data }) => setTasks(data.results || data))

      .catch(() => setError(t('workerTasks.loadFailed')))

      .finally(() => setLoading(false));

  };



  useEffect(() => {
    load();
  }, []);



  const advance = async (task, nextStatus) => {

    setBusyId(task.id);

    setError('');

    try {

      await tasksApi.updateStatus(task.id, {

        status: nextStatus,

        worker_notes: notes[task.id] ?? task.worker_notes ?? '',

      });

      load();

    } catch (err) {

      setError(

        err.response?.data?.detail ||

          err.response?.data?.[0] ||

          t('workerTasks.updateFailed')

      );

    } finally {

      setBusyId(null);

    }

  };



  const nextAction = (status) => {

    if (status === 'PENDING' || status === 'REJECTED') {

      return { label: t('workerTasks.startWork'), next: 'IN_PROGRESS' };

    }

    if (status === 'IN_PROGRESS') {

      return { label: t('workerTasks.markCompleted'), next: 'COMPLETED' };

    }

    return null;

  };



  return (

    <div className="mx-auto max-w-lg space-y-6">

      <PageHeader

        title={t('workerTasks.title')}

        subtitle={t('workerTasks.subtitle')}

      />



      {error && (

        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">

          {String(error)}

        </p>

      )}



      {loading ? (

        <p className="text-ink-500">{t('common.loading')}</p>

      ) : tasks.length === 0 ? (

        <div className="fm-panel p-8 text-center text-ink-500">

          {t('workerTasks.noTasks')}

        </div>

      ) : (

        <ul className="space-y-4">

          {tasks.map((task) => {

            const action = nextAction(task.status);

            return (

              <li key={task.id} className="fm-panel p-5">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h2 className="font-semibold text-brand-950">

                      {task.title}

                    </h2>

                    {task.description && (

                      <p className="mt-1 text-sm text-ink-500">

                        {task.description}

                      </p>

                    )}

                  </div>

                  <StatusBadge status={task.status} />

                </div>



                {task.due_date && (

                  <p className="mt-2 text-xs text-ink-500">

                    {t('workerTasks.due', { date: task.due_date })}

                  </p>

                )}



                {task.owner_feedback && (

                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">

                    {t('workerTasks.feedback')}: {task.owner_feedback}

                  </p>

                )}



                {task.rating && (

                  <div className="mt-2">

                    <StarRating value={task.rating} readOnly />

                  </div>

                )}



                {action && (

                  <div className="mt-4 space-y-2">

                    <textarea

                      className="fm-input"

                      rows={2}

                      placeholder={t('workerTasks.notesPlaceholder')}

                      value={notes[task.id] ?? task.worker_notes ?? ''}

                      onChange={(e) =>

                        setNotes((n) => ({ ...n, [task.id]: e.target.value }))

                      }

                    />

                    <button

                      type="button"

                      disabled={busyId === task.id}

                      onClick={() => advance(task, action.next)}

                      className="fm-btn fm-btn-dark w-full disabled:opacity-60"

                    >

                      {busyId === task.id

                        ? t('workerTasks.updating')

                        : action.label}

                    </button>

                  </div>

                )}

              </li>

            );

          })}

        </ul>

      )}

    </div>

  );

}



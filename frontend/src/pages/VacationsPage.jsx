import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { vacationsApi } from '../api/services';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';

const emptyForm = {
  leave_type: 'ANNUAL',
  start_date: '',
  end_date: '',
  reason: '',
};

function LeaveRequestForm({ form, set, saving, onSubmit, t }) {
  return (
    <form onSubmit={onSubmit} className="fm-panel space-y-3 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
        {t('vacations.newRequest')}
      </h2>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          {t('vacations.leaveType')}
        </span>
        <select
          required
          className="fm-input"
          value={form.leave_type}
          onChange={set('leave_type')}
        >
          {['ANNUAL', 'MEDICAL', 'PERSONAL', 'UNPAID'].map((type) => (
            <option key={type} value={type}>
              {t(`vacations.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          {t('vacations.startDate')}
        </span>
        <input
          required
          type="date"
          className="fm-input"
          value={form.start_date}
          onChange={set('start_date')}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          {t('vacations.endDate')}
        </span>
        <input
          required
          type="date"
          className="fm-input"
          value={form.end_date}
          onChange={set('end_date')}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          {t('vacations.reason')}
        </span>
        <textarea
          rows={2}
          className="fm-input"
          value={form.reason}
          onChange={set('reason')}
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="fm-btn fm-btn-dark w-full disabled:opacity-60"
      >
        {saving ? t('common.loading') : t('vacations.submitRequest')}
      </button>
    </form>
  );
}

function VacationCard({
  v,
  t,
  showEmployee,
  canCancel,
  canReview,
  feedback,
  onFeedbackChange,
  onReview,
  onCancel,
}) {
  return (
    <li className="fm-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {showEmployee && (
            <p className="font-semibold text-brand-950">{v.employee_name}</p>
          )}
          <p className="text-sm text-ink-700">
            {v.start_date} → {v.end_date}
            <span className="text-ink-500">
              {' '}
              ({t('vacations.daysCount', { count: v.days })})
            </span>
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-leaf-600">
            {t(`vacations.${v.leave_type}`, { defaultValue: v.leave_type })}
          </p>
          {v.reason && <p className="mt-1 text-sm text-ink-500">{v.reason}</p>}
          {v.review_feedback && (
            <p className="mt-2 text-sm text-ink-700">
              {t('common.feedback')}: {v.review_feedback}
            </p>
          )}
          {v.employee_role === 'MANAGER' && v.status === 'PENDING' && (
            <p className="mt-2 text-xs text-amber-800">{t('vacations.ownerApprovalNote')}</p>
          )}
        </div>
        <StatusBadge status={v.status} />
      </div>

      {canCancel && (
        <button
          type="button"
          onClick={() => onCancel(v.id)}
          className="mt-3 text-xs font-medium text-rose-700 hover:underline"
        >
          {t('vacations.cancelRequest')}
        </button>
      )}

      {canReview && (
        <div className="mt-4 space-y-2 border-t border-brand-900/10 pt-4">
          <textarea
            rows={2}
            placeholder={t('vacations.feedbackPlaceholder')}
            className="fm-input text-sm"
            value={feedback[v.id] || ''}
            onChange={(e) => onFeedbackChange(v.id, e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onReview(v.id, 'APPROVED')}
              className="fm-btn fm-btn-primary"
            >
              {t('vacations.approve')}
            </button>
            <button
              type="button"
              onClick={() => onReview(v.id, 'REJECTED')}
              className="fm-btn fm-btn-ghost text-rose-800"
            >
              {t('vacations.reject')}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function VacationsPage() {
  const { t } = useTranslation();
  const { user, isWorker, isManager, isOwner } = useAuth();
  const canSubmitLeave = isWorker || isManager;
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    vacationsApi
      .list()
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setError(t('vacations.failedLoad')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const isOwnRequest = (v) => v.employee === user?.id;

  const canReviewRequest = (v) => {
    if (v.status !== 'PENDING' || isOwnRequest(v)) return false;
    if (isOwner) return true;
    if (isManager) return v.employee_role === 'WORKER';
    return false;
  };

  const { myRequests, teamRequests } = useMemo(() => {
    if (!isManager) {
      return { myRequests: items, teamRequests: [] };
    }
    return {
      myRequests: items.filter((v) => isOwnRequest(v)),
      teamRequests: items.filter((v) => !isOwnRequest(v)),
    };
  }, [items, isManager, user?.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await vacationsApi.create(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(
        err.response?.data?.end_date?.[0] ||
          err.response?.data?.detail ||
          t('vacations.submitFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  const onReview = async (id, decision) => {
    setError('');
    try {
      await vacationsApi.review(id, {
        decision,
        review_feedback: feedback[id] || '',
      });
      load();
    } catch (err) {
      setError(
        err.response?.data?.review_feedback?.[0] ||
          err.response?.data?.detail ||
          t('vacations.reviewFailed')
      );
    }
  };

  const cancel = async (id) => {
    if (!confirm(t('vacations.cancelConfirm'))) return;
    await vacationsApi.remove(id);
    load();
  };

  const renderList = (list, { showEmployee, reviewable }) => (
    <ul className="space-y-4">
      {list.map((v) => (
        <VacationCard
          key={v.id}
          v={v}
          t={t}
          showEmployee={showEmployee}
          canCancel={canSubmitLeave && isOwnRequest(v) && v.status === 'PENDING'}
          canReview={reviewable && canReviewRequest(v)}
          feedback={feedback}
          onFeedbackChange={(id, value) =>
            setFeedback((f) => ({ ...f, [id]: value }))
          }
          onReview={onReview}
          onCancel={cancel}
        />
      ))}
    </ul>
  );

  const pageTitle = isWorker
    ? t('vacations.titleWorker')
    : isManager
      ? t('vacations.titleManager')
      : t('vacations.titleStaff');

  const pageSubtitle = isWorker
    ? t('vacations.subtitleWorker')
    : isManager
      ? t('vacations.subtitleManager')
      : t('vacations.subtitleStaff');

  return (
    <div className={`space-y-8 ${isWorker ? 'mx-auto max-w-lg' : ''}`}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {String(error)}
        </p>
      )}

      {canSubmitLeave && (
        <LeaveRequestForm
          form={form}
          set={set}
          saving={saving}
          onSubmit={onSubmit}
          t={t}
        />
      )}

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : isManager ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
              {t('vacations.myRequestsSection')}
            </h2>
            {myRequests.length === 0 ? (
              <div className="fm-panel p-8 text-center text-ink-500">
                {t('vacations.noMyRequests')}
              </div>
            ) : (
              renderList(myRequests, { showEmployee: false, reviewable: false })
            )}
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
              {t('vacations.teamRequestsSection')}
            </h2>
            {teamRequests.length === 0 ? (
              <div className="fm-panel p-8 text-center text-ink-500">
                {t('vacations.noTeamRequests')}
              </div>
            ) : (
              renderList(teamRequests, { showEmployee: true, reviewable: true })
            )}
          </section>
        </div>
      ) : items.length === 0 ? (
        <div className="fm-panel p-8 text-center text-ink-500">
          {t('vacations.noRequests')}
        </div>
      ) : (
        renderList(items, {
          showEmployee: !isWorker,
          reviewable: isOwner || isManager,
        })
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import AddReviewModal from '../reviews/AddReviewModal';
import ReviewList from '../reviews/ReviewList';
import { useAuth } from '../../hooks/useAuth';
import { deleteReview, loadReviews, type Review } from '../../services/reviewService';
import '../reviews/reviews.css';
import './admin.css';

export default function ReviewsAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, session } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true);
    else setInitialLoading(true);

    try {
      const data = await loadReviews();
      setReviews(data);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const userReview = session?.user?.id
    ? reviews.find((r) => r.userId === session.user.id)
    : null;

  const handleAddClick = () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/reviews');
      return;
    }
    if (userReview) {
      setNotice('Ya publicaste una reseña. Solo se permite una por persona.');
      return;
    }
    setModalOpen(true);
  };

  const handleSaved = () => {
    setNotice('Reseña publicada.');
    void reload({ silent: true });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteReview(id);
      setNotice('Reseña eliminada.');
      void reload({ silent: true });
    } catch (e) {
      setNotice(`Error: ${(e as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-page-header-row">
        <div className="admin-page-header">
          <p className="caption">Administración</p>
          <h1>Reseñas</h1>
        </div>
        {!userReview ? (
          <button type="button" className="admin-btn primary" onClick={handleAddClick}>
            <Plus size={15} />
            Agregar reseña
          </button>
        ) : null}
      </div>

      {notice ? (
        <div className={`admin-notice${notice.startsWith('Error') ? ' error' : ''}`} role="status">
          {notice}
        </div>
      ) : null}

      {error ? <div className="admin-notice error">Error: {error}</div> : null}

      {refreshing ? <p className="review-refreshing">Actualizando…</p> : null}

      <div className="admin-card">
        <ReviewList
          reviews={reviews}
          loading={initialLoading}
          emptyMessage="No hay reseñas todavía."
          showDelete
          deletingId={deletingId}
          onDelete={(id) => void handleDelete(id)}
        />
      </div>

      <AddReviewModal open={modalOpen} onClose={closeModal} onSaved={handleSaved} />
    </div>
  );
}

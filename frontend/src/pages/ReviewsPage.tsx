import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddReviewModal from '../features/reviews/AddReviewModal';
import ReviewList from '../features/reviews/ReviewList';
import { useAuth } from '../hooks/useAuth';
import { loadReviews, type Review } from '../services/reviewService';
import '../components/home.css';
import '../features/reviews/reviews.css';

export default function ReviewsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, session } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);

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
      navigate('/login?redirect=/resenas');
      return;
    }
    if (userReview) {
      setNotice('Ya publicaste una reseña. Solo se permite una por persona.');
      return;
    }
    setModalOpen(true);
  };

  const handleSaved = () => {
    setNotice('Tu reseña se publicó correctamente.');
    void reload({ silent: true });
  };

  return (
    <div className="fade-in">
      <Header />
      <main>
        <section className="section container">
          <div className="review-page-header">
            <div>
              <p className="caption">Opiniones</p>
              <h1 className="home-h2" style={{ marginTop: 'var(--stack-sm)' }}>
                Reseñas
              </h1>
            </div>
            {!userReview ? (
              <button
                type="button"
                className="btn btn-primary btn-sm review-add-btn"
                onClick={handleAddClick}
                disabled={authLoading}
              >
                <Plus size={16} />
                Agregar reseña
              </button>
            ) : (
              <span className="review-already-notice">Ya compartiste tu reseña</span>
            )}
          </div>

          <div className="divider" style={{ marginBottom: 'var(--stack-lg)' }} />

          {notice ? <div className="review-notice" role="status">{notice}</div> : null}
          {error ? (
            <p className="review-form-error" role="alert">
              Error: {error}
            </p>
          ) : null}

          {refreshing ? <p className="review-refreshing">Actualizando…</p> : null}

          <ReviewList reviews={reviews} loading={initialLoading} />
        </section>
      </main>
      <Footer />

      <AddReviewModal open={modalOpen} onClose={closeModal} onSaved={handleSaved} />
    </div>
  );
}

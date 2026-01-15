import Header from '../components/Header';

const Support = () => (
  <div className="min-h-screen bg-gray-50">
    <Header title="Support" showSearch={false} />
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Contact Support</h2>
        <p className="mb-2"><strong>Email:</strong> support@jotter.com</p>
        <p className="mb-2"><strong>Phone:</strong> +1-800-JOTTER</p>
        <p className="text-gray-600 mt-4">We're here to help! Reach out anytime.</p>
      </div>
    </div>
  </div>
);

export default Support;
import Header from '../components/Header';

const Terms = () => (
  <div className="min-h-screen bg-gray-50">
    <Header title="Terms & Conditions" showSearch={false} />
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
        <div className="space-y-4 text-gray-700">
          <p>By using Jotter, you agree to these terms...</p>
          <p><strong>1. Account Usage</strong><br />You are responsible for maintaining the confidentiality of your account.</p>
          <p><strong>2. Storage</strong><br />You receive 15GB of free storage space.</p>
          <p><strong>3. Privacy</strong><br />Your data is secure and private.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms;
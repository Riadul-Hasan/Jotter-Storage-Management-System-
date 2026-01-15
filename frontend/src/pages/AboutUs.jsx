import Header from '../components/Header';

const AboutUs = () => (
  <div className="min-h-screen bg-gray-50">
    <Header title="About Us" showSearch={false} />
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">About Jotter</h2>
        <p className="text-gray-700 leading-relaxed">
          Jotter is your personal storage management system. Organize notes, images, PDFs, and folders all in one place with 15GB of free storage. Built with modern technologies to provide a seamless experience.
        </p>
      </div>
    </div>
  </div>
);

export default AboutUs;
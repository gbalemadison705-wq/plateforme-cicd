import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { repositoryService } from '../services/api'
import axios from 'axios'

function Repositories() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newRepo, setNewRepo] = useState({ 
  nom: '', 
  description: '', 
  github_url: '',
  github_branch: 'main'
 })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadRepositories()
  }, [user, navigate])

  const loadRepositories = async () => {
    try {
      const response = await repositoryService.getAll()
      setRepositories(response.data.repositories)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
  e.preventDefault();
  try {
    await repositoryService.create(newRepo);  // ← newRepo contient maintenant github_url et github_branch
    setShowModal(false);
    setNewRepo({ nom: '', description: '', github_url: '', github_branch: 'main' });
    loadRepositories();
    alert('Depot cree avec succes !');
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de la creation');
  }
 } 

  const handleDelete = async (id) => {
    if (!confirm('Etes-vous sur de vouloir supprimer ce depot ?')) return
    
    try {
      await repositoryService.delete(id)
      loadRepositories()
      alert('Depot supprime')
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleTriggerBuild = async (repoId) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/webhooks/trigger/${repoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert(`Build declenche ! ID: ${response.data.buildId}`);
      // Rafraichir apres 2 secondes
      setTimeout(() => {
        loadRepositories();
      }, 2000);
    } catch (error) {
      alert('Erreur lors du declenchement du build');
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Plateforme CI/CD</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Bonjour, {user?.nom_utilisateur}</span>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 py-3">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 pb-3">Dashboard</Link>
            <Link to="/repositories" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3">
              Mes Depots
            </Link>
            <Link to="/builds" className="text-gray-600 hover:text-blue-600 pb-3">Mes Builds</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Mes Depots</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Nouveau Depot
          </button>
        </div>

        {repositories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">Vous n avez pas encore de depot</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:underline"
            >
              Creer mon premier depot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div key={repo.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{repo.nom}</h3>
                <p className="text-gray-600 text-sm mb-4">{repo.description || 'Pas de description'}</p>
            <div className="flex justify-between items-center text-sm gap-2">
                  <span className="text-gray-600">{repo.total_builds} build(s)</span>
                  <div className="flex gap-2">
                <button
                onClick={() => handleTriggerBuild(repo.id)}
               className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
           >
            Declencher Build
           </button>
            <button
              onClick={() => handleDelete(repo.id)}
            className="text-red-600 hover:underline text-xs"
            >
               Supprimer
             </button>
          </div>
   </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Create */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Nouveau Depot</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={newRepo.nom}
                  onChange={(e) => setNewRepo({ ...newRepo, nom: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRepo.description}
                  onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du depot GitHub
            </label>
          <input
      type="url"
      value={newRepo.github_url}
      onChange={(e) => setNewRepo({ ...newRepo, github_url: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      placeholder="https://github.com/username/repo"
      required
      />
    <p className="text-xs text-gray-500 mt-1">
      Exemple: https://github.com/votre-nom/mon-projet
    </p>
   </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Branche (optionnel)
    </label>
    <input
      type="text"
      value={newRepo.github_branch}
      onChange={(e) => setNewRepo({ ...newRepo, github_branch: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      placeholder="main"
     />
   </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Creer
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Repositories
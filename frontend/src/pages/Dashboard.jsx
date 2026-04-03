import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { buildService, repositoryService } from '../services/api'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    try {
      const [statsRes, reposRes] = await Promise.all([
        buildService.getStats(),
        repositoryService.getAll()
      ])
      setStats(statsRes.data.stats)
      setRepositories(reposRes.data.repositories)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Plateforme CI/CD</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Bonjour, {user?.nom_utilisateur}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 py-3">
            <Link to="/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3">
              Dashboard
            </Link>
            <Link to="/repositories" className="text-gray-600 hover:text-blue-600 pb-3">
              Mes Depots
            </Link>
            <Link to="/builds" className="text-gray-600 hover:text-blue-600 pb-3">
              Mes Builds
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Tableau de bord</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Builds</p>
            <p className="text-3xl font-bold text-gray-800">{stats?.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Builds Reussis</p>
            <p className="text-3xl font-bold text-green-600">{stats?.reussis || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Builds Echoues</p>
            <p className="text-3xl font-bold text-red-600">{stats?.echoues || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Mes Depots</p>
            <p className="text-3xl font-bold text-blue-600">{repositories.length}</p>
          </div>
        </div>

        {/* Recent Repos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mes Depots Recents</h3>
          {repositories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Vous n avez pas encore de depot</p>
              <Link to="/repositories" className="text-blue-600 hover:underline">
                Creer mon premier depot
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {repositories.slice(0, 5).map((repo) => (
                <div key={repo.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{repo.nom}</p>
                    <p className="text-sm text-gray-600">{repo.description || 'Pas de description'}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {repo.total_builds} build(s)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
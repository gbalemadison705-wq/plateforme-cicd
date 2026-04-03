import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { buildService } from '../services/api'

function Builds() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadBuilds()
  }, [user, navigate])

  const loadBuilds = async () => {
    try {
      const response = await buildService.getAll()
      setBuilds(response.data.builds)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'reussi': return 'bg-green-100 text-green-800'
      case 'echoue': return 'bg-red-100 text-red-800'
      case 'en_cours': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'reussi': return 'Reussi'
      case 'echoue': return 'Echoue'
      case 'en_cours': return 'En cours'
      case 'en_attente': return 'En attente'
      case 'annule': return 'Annule'
      default: return status
    }
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
            <Link to="/repositories" className="text-gray-600 hover:text-blue-600 pb-3">Mes Depots</Link>
            <Link to="/builds" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3">
              Mes Builds
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Historique des Builds</h2>

        {builds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Aucun build pour le moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Depot</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Commit</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Message</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {builds.map((build) => (
                  <tr key={build.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{build.depot_nom}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {build.commit_hash?.substring(0, 7)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {build.commit_message || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(build.statut)}`}>
                        {getStatusText(build.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(build.date_debut).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default Builds
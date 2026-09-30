import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { corridorPolygons, getVisibleParcels, userProfiles } from '../data/mockData'

const colorMap = {
  Completed: '#2e7d32',
  Awarded: '#1976d2',
  Pending: '#ef6c00',
  Objection: '#f9a825',
  Blocked: '#d32f2f',
  Paid: '#0f766e',
}

export default function GISMapPage({ role = 'nationalOfficer', projectRecords }) {
  const profile = userProfiles.find((item) => item.role === role)
  const allowedParcelIds = new Set(getVisibleParcels(role, profile, projectRecords).map((parcel) => parcel.id))
  const visiblePolygons = ['nationalOfficer', 'admin'].includes(role) ? corridorPolygons : corridorPolygons.filter((parcel) => allowedParcelIds.has(parcel.id))
  return (
    <div className="stack-block">
      <div className="section-header"><h2>GIS Acquisition Map</h2><span className="pill neutral">Corridor Readiness 92%</span></div>

      <div className="panel-card map-panel">
        <div className="map-legend">
          {Object.entries(colorMap).map(([label, color]) => (
            <span key={label}><i style={{ background: color }} />{label}</span>
          ))}
        </div>
        <MapContainer center={[25.7, 82.7]} zoom={9} scrollWheelZoom className="leaflet-map">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {visiblePolygons.map((parcel) => (
            <Circle
              key={parcel.id}
              center={[parcel.lat, parcel.lng]}
              radius={3500}
              pathOptions={{ color: colorMap[parcel.status], fillColor: colorMap[parcel.status], fillOpacity: 0.5 }}
            >
              <Popup>
                <strong>{parcel.key}</strong><br />
                {parcel.label}<br />
                <span>{parcel.status}</span>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

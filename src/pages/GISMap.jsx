import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { corridorPolygons, userProfiles } from '../data/mockData'

const colorMap = {
  Completed: '#2e7d32',
  Awarded: '#1976d2',
  Pending: '#ef6c00',
  Objection: '#f9a825',
  Blocked: '#d32f2f',
  Paid: '#0f766e',
}

export default function GISMapPage({ role = 'nationalOfficer' }) {
  const profile = userProfiles.find((item) => item.role === role)
  const visiblePolygons = role === 'fieldOfficer'
    ? corridorPolygons.filter((parcel) => profile?.assignedParcelIds?.includes(parcel.id))
    : role === 'citizen'
      ? corridorPolygons.filter((parcel) => profile?.parcelIds?.includes(parcel.id))
      : corridorPolygons
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
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

import { useCallback, useEffect, useRef, useState } from 'react'
import { getAll, getById } from './services/stopsService'

import bus from './assets/img/mini-bus.png'
import busRed from './assets/img/bus-red.jpg'

function App () {
  const [service, setService] = useState()
  const [stops, setStops] = useState([])
  const [stopsFilter, setStopsFilter] = useState([])
  const [stop, setStop] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [lastSearchs, setLastSearchs] = useState(JSON.parse(localStorage.getItem('lastSearchs')) || [])

  const searchInputRef = useRef(null)

  const getAllStops = useCallback(async () => {
    const data = await getAll()
    setStops(data)
    setStopsFilter(data.slice(0, 10))
  }, [])

  const getStopById = useCallback(async (id) => {
    setLoading(true)
    const data = await getById(id)
    data.servicios.item = data.servicios.item.sort((a, b) => a.distanciabus1 - b.distanciabus1)
    setService(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (lastSearchs.length > 0) {
      localStorage.setItem('lastSearchs', JSON.stringify(lastSearchs))
    }
  }, [lastSearchs])

  useEffect(() => {
    getAllStops()
  }, [])

  useEffect(() => {
    if (stop) {
      getStopById(stop)
      let lastSearchsFiltered = [stop, ...lastSearchs]
      lastSearchsFiltered = lastSearchsFiltered.filter(function (item, index, array) {
        return array.indexOf(item) === index
      })
      if (lastSearchsFiltered.length > 10) {
        lastSearchsFiltered.pop()
      }
      setLastSearchs(lastSearchsFiltered)
    }
  }, [stop])

  const handleClick = (e) => {
    setShowFilter(e.target.id === 'input-search')
  }

  useEffect(() => {
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const handleStopChange = (id) => {
    setStop(id)
    searchInputRef.current.value = id
    setShowFilter(false)
  }

  const handleInputChange = () => {
    const { value } = searchInputRef.current
    searchInputRef.current.value = value.toUpperCase()
    const inputStopsFiltered = stops.filter((stop) => {
      return stop.toLowerCase().includes(value.toLowerCase())
    }).slice(0, 20)
    setStopsFilter(inputStopsFiltered)
  }

  return (
    <div className="flex justify-center w-screen h-screen">

      <div className='flex-col' >
        <div className="flex md:justify-between justify-items-center mb-5 mt-5 md:mb-0 md:mt-0">
          <h1 className='text-5xl font-light text-gray-500 md:mt-20'>Donde viene la micro</h1>
          <img className="invisible md:visible w-0 h-0 md:w-80 md:h-52" src={busRed} alt="Bur Red" />
        </div>

        <div className={`mr-2 ml-2 md:ml-0 md:mr-0 transform transition-all duration-200 ease-out ${lastSearchs.length > 0 ? 'scale-100' : 'scale-0'}`}>
          <h1 className="text-sm">Últimas Búsquedas</h1>
          <div className="flex-col border-2 mb-2 p-2 h-20 overflow-auto overflow-y-hidden max-w-xs md:max-w-4xl">
            <div className="flex">
              {
                lastSearchs.length > 0 && lastSearchs.map((stop) => (
                  <div key={stop} className="flex p-3 min-w-fit border-2 mr-2 rounded-lg cursor-pointer hover:bg-gray-200" onClick={() => handleStopChange(stop)}>
                    <img className="w-5 h-5 mr-2" src={bus} alt="Bus" />
                    <span>{stop}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        <div className="flex mb-5">

          <div className="relative flex">
              <input
                autoComplete="off"
                tabIndex={1}
                id="input-search"
                ref={searchInputRef}
                className="border-4 cursor-text w-52 ml-2 md:ml-0"
                type="text"
                placeholder="Buscar Parada"
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && handleStopChange(e.target.value)}
              />
            {
              showFilter &&
                <div className="absolute z-50 bg-white top-7 h-72 overflow-auto ml-2 md:ml-0">
                  <ul className="w-52 shadow-2xl border-4">
                    {
                      stopsFilter.map((stop, index) => (
                        <li tabIndex={0}
                            key={stop}
                            autoFocus={index === 0}
                            className="border-2 cursor-pointer hover:bg-gray-200 hover:text-gray-900"
                            onClick={() => handleStopChange(stop)}
                            onKeyDown={e => e.key === 'Enter' && handleStopChange(stop)}
                        >
                            {stop}
                        </li>
                      ))
                    }
                  </ul>
                </div>
            }
          </div>

          <div className="flex flex-col justify-end">
            <button
              disabled={stop === '' || searchInputRef.current.value === ''}
              className="bg-blue-500 p-1 ml-5 rounded text-white disabled:bg-gray-300 hover:bg-blue-700"
              onClick={() => getStopById(stop)}
            >
              Actualizar
            </button>
          </div>

        </div>

        {
          <div className="w-full">
            <div className="flex justify-between justify-items-center bg-gray-100 mb-10">
              <h2 className="text-2xl p-5">{service?.nomett ? service.nomett : 'Seleccione una parada'}</h2>
              <a className={service ? 'bg-blue-100 p-5' : 'invisible p-5'}
                 href={`https://www.google.com/maps/search/?api=1&query=${service?.x},${service?.y}&zoom=20`}
                 target="_blank"
                 rel="noreferrer"
              >
                  Ver Mapa 🗺️
              </a>
            </div>

              <table className="table-auto mb-10 w-screen max-w-4xl text-center">
                <thead>
                  <tr className="text-slate-600 border-b border-slate-500">
                    <th className="p-3 w-20">Nº</th>
                    <th className='p-3'>Dirección</th>
                    <th className='p-3 w-48'>Viene en</th>
                  </tr>
                </thead>
                <tbody>
                  { loading
                    ? <tr><td colSpan={3} className="text-slate-500 text-center p-5">Cargando...</td></tr>
                    : service?.servicios?.item?.map(({ servicio, destino, respuestaServicio, horaprediccionbus1 }, index) => (
                      !respuestaServicio && (
                        <tr key={`${servicio}-${index}`} className="text-slate-500 border-b border-slate-500 p-5">
                          <td className="p-3 flex">
                            <img className="w-5 h-5 mr-2" src={bus} alt="Bus" />
                            <span>{servicio}</span>
                          </td>
                          <td>{destino}</td>
                          <td>{horaprediccionbus1}</td>
                        </tr>
                      )
                    ))
                  }
                </tbody>
                </table>
          </div>

        }
      </div>

    </div>
  )
}

export default App

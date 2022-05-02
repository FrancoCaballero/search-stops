export const getAll = () => {
  return fetch('https://www.red.cl/restservice_v2/rest/getparadas/all')
    .then(res => res.json())
}

export const getById = (id) => {
  return fetch(`https://www.red.cl/predictor/prediccion?t=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTEwNzExOTIzNjB9.VgYBx7iIehTvIXR1Vg_ZfWj4dYlcXR2chAuzRwS-Ahk&codsimt=${id}&codser=`)
    .then(res => res.json())
}

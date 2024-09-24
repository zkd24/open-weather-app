'use client'
import { TextField, Button } from '@mui/material'
import Image from 'next/image'
import { useState, useEffect } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const [cities, setCities] = useState([])
  const [temp, setTemp] = useState(null)
  const [icon, setIcon] = useState('')
  const [chosenCity, setChosenCity] = useState('')

  useEffect(() => {
    if (!inputValue) {
      setCities([])
      setTemp(null)
      setIcon('')
      setChosenCity('')
    }
  }, [inputValue])

  const getCity = (city) => {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=100&appid=cc0f768036c23750cb17b7c1874f723b`)
      .then(res => res.json())
      .then(res => {
        if (res.length > 0) {
          const options = removeDupes(
            res.map(item => {
            return {
              label: item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`,
              cityName: item.name,
              lon: item.lon,
              lat: item.lat
            }
          }))
          setCities(options)
        }
      })
  }

  const getWeather = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=metric&appid=cc0f768036c23750cb17b7c1874f723b`)
      .then(res => res.json())
      .then(res => {
        if (res) {
          console.log(res)
          setTemp(res.current.temp)
          setIcon(res.current.weather[0].icon)
        }
      })
  }

  const clear = () => {
    setCities([])
    setTemp(null)
    setIcon('')
    setChosenCity('')
  }

  const handleChange = (e) => {
    e.preventDefault()
    if(e.type ==='reset'){
      setInputValue('')
    } else {
      getCity(e.target.value)
      setInputValue(e.target.value)
    }
  }

  const handleClick = (lat, lon, label)=>{
    getWeather(lat, lon)
    setChosenCity(label)
  }
  const handleSubmit=(e)=>{
    e.preventDefault()
  }
  const bgc = icon.slice(2) === 'n' ? 'bg-slate-500' : 'bg-blue-400'

  return (
    <div className='bg-gray-50 p-10 h-screen m-auto text-center flex flex-col '>
      <form className='mt-6' onSubmit={(e)=>handleSubmit(e)} onReset={clear}>
          <h1 className='text-2xl m-3'>
          What is the weather like in...
          </h1>
          <div className='flex items-center justify-center'>
            <TextField className='bg-white mr-3' placeholder='Toronto' inputValue={inputValue} onChange={handleChange}/>
            <Button disableRipple type='reset'>Reset</Button>
          </div>
      </form>
      <ul className='flex flex-wrap space-x-2 mt-3 justify-center'>
      {cities.length > 0 && cities.map(city=>{
        return (
          <li className='my-3' key={city.label}>
            <Button 
            disableRipple 
            className={city.label === chosenCity ? 'bg-purple-200':'bg-gray-200'} 
            onClick={()=>handleClick(city.lat, city.lon, city.label)}>{city.label}</Button>
          </li>
          )
      })}
      </ul>
      {temp !== null 
        ? <div className={`${bgc} w-1/2 mt-3 m-auto rounded-md p-5 max-w-60`}>
            <Image
            className='m-auto'
              width={100}
              height={100}
              alt=''
              src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            />
            <p className='text-xl sm:text-3xl pb-3'>{temp}°C</p>
          </div>
          : null
      }
    </div>
  )
}


const removeDupes = (arr) => {
  if (arr.length === 0) return
  return arr.reduce((acc, current) => {
    if (!acc.some(item => item.label === current.label)) {
      acc.push(current);
    }
    return acc;
  }, []);
}

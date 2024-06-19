import { useEffect, useState } from 'react'
import TopMenu from './TopMenu'
import OrganizationUnitTree from './OrganizationUnitTree'
import OrgUnitLevelMenu from './orgUnitLevelMenu'
import DateRangeSelector from './DateRangeSelector'
import { getDataElements, getIndicators } from '../service/useApi'
import DataElementsMenu from './DataElements'

// eslint-disable-next-line react/prop-types
const MainPage = ({ dhis2Url, username, password, handleDisconnect }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([])
  const [OrgUnitLevel, selectOrgUnitLevel] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [period, setPeriod] = useState('year')
  const [dataPoints, setdataPoints] = useState([])
  const [filteredDataPoints, setFilteredDataPoints] = useState([])
  const [addedDataPoints, setAddedDataPoints] = useState([])
  const [selectedDataPoints, setSelectedDataPoints] = useState([])

  useEffect(async () => {
    try {
      const elements = await getDataElements(dhis2Url, username, password)
      const indicators = await getIndicators(dhis2Url, username, password)
      const data = [...elements.dataElements, indicators.indicators]
      setdataPoints(data)
      setFilteredDataPoints(data)
    } catch (error) {
      console.log(error)
    }
  }, [dhis2Url, username, password])

  const handleOrgUnitSelect = (unitId) => {
    if (selectedOrgUnits.includes(unitId)) {
      setSelectedOrgUnits(selectedOrgUnits.filter((id) => id !== unitId))
    } else {
      setSelectedOrgUnits([...selectedOrgUnits, unitId])
    }
  }

  const handleOrgUnitLevel = (event) => {
    selectOrgUnitLevel(event.target.value)
  }

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value)
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value)
  }

  const handlePeriod = (event) => {
    setPeriod(event.target.value)
  }

  const handleFilterDataPoint = (event) => {
    const searchTerm = event.target.value ? event.target.value.toLowerCase() : ''
    const filteredData = dataPoints.filter((element) =>
      element.displayName ? element.displayName.toLowerCase().includes(searchTerm) : false
    )
    setFilteredDataPoints(filteredData)
  }

  const handleSelectDataPoint = (event) => {
    const selectedOptionId = Array.from(event.target.selectedOptions).map((option) => option.value)
    const selectedData = dataPoints.filter((element) => selectedOptionId.includes(element.id))
    setSelectedDataPoints(selectedData)
  }

  const handleAddSelectedDataPoint = () => {
    // Avoid duplicated selection
    const allSelectedIds = [
      ...addedDataPoints.map((item) => item.id),
      ...selectedDataPoints.map((item) => item.id)
    ]
    const uniqueSelectedDataId = Array.from(new Set(allSelectedIds))
    const uniqueSelectedData = dataPoints.filter((element) =>
      uniqueSelectedDataId.includes(element.id)
    )
    setAddedDataPoints(uniqueSelectedData)
    console.log(uniqueSelectedDataId)

    // Remove selected elements from displayed items.
    const updatedFilteredDataPoints = filteredDataPoints.filter(
      (element) => !uniqueSelectedDataId.includes(element.id)
    )

    setFilteredDataPoints(updatedFilteredDataPoints)
    setSelectedDataPoints([])
  }

  const handleRemoveDataPoint = (elementId) => {
    const dataToRemove = addedDataPoints.find((element) => element.id === elementId)
    console.log(dataToRemove)
    setFilteredDataPoints(filteredDataPoints.concat(dataToRemove))
    setAddedDataPoints(addedDataPoints.filter((element) => element.id !== elementId))
  }

  return (
    <div>
      <TopMenu username={username} handleDisconnect={handleDisconnect} />
      <div dir="ltr">
        <div className="flex px-4 py-8">
          <div className="w-1/3 px-4 py-8" style={{ height: '70vh' }}>
            <h3 className="text-xl font-bold mb-2">Organization Units</h3>
            <div
              className="overflow-y-scroll border border-gray-300 p-4 bg-gray-100"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <OrganizationUnitTree
                dhis2Url={dhis2Url}
                username={username}
                password={password}
                onSelect={handleOrgUnitSelect}
              />
            </div>
          </div>
          <div className="w-1/3 px-4 py-8">
            <h3 className="text-xl font-bold mb-2">Organization Levels</h3>
            <div className="overflow-y-auto mb-4">
              <OrgUnitLevelMenu
                dhis2Url={dhis2Url}
                username={username}
                password={password}
                OrgUnitLevel={OrgUnitLevel}
                handleOrgUnitLevel={handleOrgUnitLevel}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Date Range</h3>
            <div className="overflow-y-auto">
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                period={period}
                handleStartDateChange={handleStartDateChange}
                handleEndDateChange={handleEndDateChange}
                handlePeriod={handlePeriod}
              />
            </div>
          </div>
          <div className="w-1/3 px-4 py-8" style={{ height: '70vh' }}>
            <h3 className="text-xl font-bold mb-2">Data Elements and Indicators</h3>
            <div
              className="overflow-y-scroll border border-gray-300 p-4 bg-gray-100"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <DataElementsMenu
                dataPoints={dataPoints}
                filteredDataPoints={filteredDataPoints}
                addedDataPoints={addedDataPoints}
                handleFilterDataPoint={handleFilterDataPoint}
                handleSelectDataPoint={handleSelectDataPoint}
                handleAddSelectedDataPoint={handleAddSelectedDataPoint}
                handleRemoveDataPoint={handleRemoveDataPoint}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MainPage

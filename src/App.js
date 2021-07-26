import Fluid from './lib/Fluid'
import Field from './lib/Field'
import FieldView from './components/FieldView'
import {useState, useEffect} from "react"
import testField from './lib/tests'

function App() {
  let [fluid, setFluid] = useState(new Fluid(0.5, 0.5, 0));
  let [field, setField] = useState(new Field(20, fluid));
  testField()

  return (
    <div id="App" >
      <FieldView field={field}/>
    </div>
  );
}

export default App;

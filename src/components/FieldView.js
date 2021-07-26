export default function FieldView({field}) {

    return (
        <div id="Field">
            {field.density.map((density, densityIdx) => <div 
                                                    key={`density-${densityIdx}`}
                                                    id={`density-${densityIdx}`}
                                                    className="field-item" 
                                                    style={{"backgroundColor":`rgba(117,255,232, ${density})`}}
                                                    onClick={(e) => {
                                                        field.add_density(0,0,20);
                                                        console.log(field.density)
                                                    }}
                                                    ></div>)}
                                                    <button onClick={(e) => {
                                                        field.step_simulation()
                                                        console.log(field)
                                                    }}>Step</button>
        </div>
    )
}
import { useState } from "react";
import TextInput from "../TextInput/TextInput";
import CircleLoader from "../CircleLoader/CircleLoader";
import "./NutritionForm.css";
import ApiClient from "../../../services/apiClient";
import { useNavigate } from "react-router-dom";

export default function NutritionForm({ setAppState, user}) {

    const navigate = useNavigate();
    const [formOnSubmitState, setFormOnSubmitState] = useState({
        showLoader: false,
        errorMessage: "",
        showErrorLoader: false,
        showSuccess: false,
    })
    const showLoader = () => {
        console.log(formOnSubmitState);
        setFormOnSubmitState({ ...formOnSubmitState, showLoader: true });
    }
    const hideLoader = () => {
        setFormOnSubmitState(() => ({ ...formOnSubmitState, showLoader: false }));
    }
    const showSuccessLoader = () => {
        setFormOnSubmitState(() => ({ ...formOnSubmitState, showSuccess: true }));
    }
    const showErrorLoader = () => {
        setFormOnSubmitState(() => ({ ...formOnSubmitState, showErrorLoader: true }));
    }
    // Used for activity loader
    // const loaderStates = {
    //     success: !formOnSubmitState.showErrorLoader && formOnSubmitState.showSuccess,
    //     failure: formOnSubmitState.showErrorLoader && !formOnSubmitState.showSuccess
    // }
    const [formData, setFormData] = useState({
        name: "",
        calories: "",
        category: "Food",
        quantity: 1
    });

    const onNutritionFormSubmit = async (event) => {
        event.preventDefault();
        showLoader();
        const {success, statusCode, data } = await ApiClient.postEntry("nutrition", {...formData, userId: user.email});
        if (success){
            // update app state with data
            showSuccessLoader();
            console.log("retrieve nutrition entry: ", data);
            navigate("/nutrition");
        }else{
            showErrorLoader();
            if (statusCode == 422){
                const message = "Invalid response. Please review the required field and try again."
                setFormOnSubmitState(({ ...formOnSubmitState, errorMessage: message }));
            } else{
                console.log("error with status code", statusCode)
            }
        }
    }
    const onValueChange = (event) => {
        // updates form data values
        const name = event.target.name;
        let value = event.target.value;
        if ((name == "quantity" || name == "calories") && parseInt(value) < 0) {
            value = 0
        }
        setFormData(() => ({
            ...formData,
            [name]: value
        }));
        console.log(formData);
    }
    return (
        <div className="nutrition-entry-container">
            <div className="nutrition-entry-content">
                <div className="nutrition-entry-header">
                    <h2>Add Nutrition</h2>
                </div>
                <form onSubmit={onNutritionFormSubmit} className="nutrition-entry-form">
                    <div className="nutrition-form-content box-shadow">
                        <TextInput
                            name={"name"}
                            placeholder={"Name"}
                            onChange={onValueChange}
                            value={formData.name}
                            helperText={{ constraint: "be non-empty", expression: formData.name == "" }}
                            showLabel={true} />
                        <div className="category-container">
                            <label htmlFor="category">Cateogory:</label>
                            <select onChange={onValueChange} className="nutrition-category-select" name="category">
                                <option value="Food">Food</option>
                                <option value="Beverage">Beverage</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>
                        <TextInput
                            value={formData.calories}
                            onChange={onValueChange}
                            name="calories"
                            placeholder="Calories"
                            type="number"
                            helperText={{ constraint: "be non-zero", expression: formData.calories == 0 }}
                            showLabel={true} />
                        <TextInput value={formData.quantity}
                            onChange={onValueChange}
                            name="quantity"
                            min="0"
                            placeholder="Quantity"
                            type="number"
                            helperText={{ constraint: "be non-zero", expression: formData.quantity == 0 }}
                            showLabel={true} />
                        <button className="btn-compact-medium">Save</button>
                    </div>
                </form>
                <p className={"form-helper-text" + (formOnSubmitState.errorMessage !== "" ? " show" : "")}>
                    {formOnSubmitState.errorMessage}
                </p>
            </div>
                {/* <CircleLoader
                    showLoading={formOnSubmitState.showLoader}
                    isFailure={loaderStates.failure}
                    isSuccess={loaderStates.success} /> */}
        </div>

    )
}
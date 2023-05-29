import CheckBox from './components/form/checkbox/CheckBox'
import CheckBoxWarning from './components/form/checkbox/CheckBoxWarning'

import DatePicker from './components/form/date/DatePicker'
import TimePicker from './components/form/date/TimePicker'

import FileUpload from './components/form/file/FileUpload'
import ActiveInput from './components/form/input/ActiveInput'

import AutoComplete from './components/form/input/AutoComplete'
import FetchAutoComplete from './components/form/input/FetchAutoComplete'
import Input from './components/form/input/Input'
import MaskInput from './components/form/input/MaskInput'
import MultInput from './components/form/input/MultInput'
import OtherCheckBox from './components/form/input/OtherCheckBox'

import Stepper from './components/form/stepper/Stepper'
import StepperBlock from './components/form/stepper/StepperBlock'

import Switch from './components/form/switch/Switch'
import Table from './components/form/table/Table'

import NavBar from './components/navbar/NavBar'

import FormProvider from './components/providers/FormProvider'
import { OAuthProvider, cookieName as AUTH_COOKIE_NAME } from './components/providers/OAuthProvider'
import { LoginProvider } from './components/providers/LoginProvider'

import { AuthContext } from './context/auth'
import { FormContext } from './context/form'

import { Login } from './components/page/Login'

import { Category } from './components/detalhes/Category'
import { Field } from './components/detalhes/Field'
import { FieldLabel } from './components/detalhes/FieldLabel'
import { File } from './components/detalhes/File'

export {
    CheckBox,
    CheckBoxWarning,
    DatePicker,
    TimePicker,
    FileUpload,
    ActiveInput,
    AutoComplete,
    FetchAutoComplete,
    Input,
    MaskInput,
    MultInput,
    OtherCheckBox,
    Stepper,
    StepperBlock,
    Switch,
    Table,
    NavBar,
    FormProvider,
    OAuthProvider,
    AUTH_COOKIE_NAME,
    AuthContext,
    FormContext,
    LoginProvider,

    //detalhes
    Category,
    Field,
    FieldLabel,
    File,
    Login as LoginPage
}

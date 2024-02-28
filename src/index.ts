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
import { SwitchWatch, ToggleVisibility } from './components/form/switch/ToggleVisibility'

import Table from './components/form/table/Table'

import NavBar from './components/navbar/NavBar'

import FormProvider from './components/providers/FormProvider'
import { OAuthProvider, cookieName as AUTH_COOKIE_NAME } from './components/providers/OAuthProvider'

import { AuthContext } from './context/auth'
import { FormContext } from './context/form'

import { Category } from './components/detalhes/Category'
import { Field } from './components/detalhes/Field'
import { FieldLabel } from './components/detalhes/FieldLabel'
import { File } from './components/detalhes/File'

import CheckBoxAdditional from './components/form/checkbox/CheckBoxAdditional'
import RequiredCheckBoxGroup from './components/form/checkbox/RequiredCheckBoxValidator'

import { KeycloakAuthProvider } from './components/providers/KeycloakAuthProvider'
import { FixedAutoComplete } from './components/form/input/FixedAutoComplete'

import DropFileUpload from './components/form/file/DropFileUpload'
import { sspModal } from './components/modal/Modal'

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
    SwitchWatch,
    ToggleVisibility,
    Table,
    NavBar,
    FormProvider,
    OAuthProvider,
    AUTH_COOKIE_NAME,
    AuthContext,
    FormContext,
    KeycloakAuthProvider,
    CheckBoxAdditional,
    RequiredCheckBoxGroup,
    FixedAutoComplete,
    //detalhes
    Category,
    Field,
    FieldLabel,
    File,

    //new
    DropFileUpload,
    sspModal
}

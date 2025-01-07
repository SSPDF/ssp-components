import CheckBox from './components/form/checkbox/CheckBox'
import CheckBoxWarning from './components/form/checkbox/CheckBoxWarning'

import DatePicker from './components/form/date/DatePicker'
import GenericDatePicker from './components/form/date/GenericDatePicker'
import TimePicker from './components/form/date/TimePicker'

import FileUpload from './components/form/file/FileUpload'
import ActiveInput from './components/form/input/ActiveInput'

import AutoComplete from './components/form/input/AutoComplete'
import FetchAutoComplete from './components/form/input/FetchAutoComplete'
import GenericFetchAutoComplete from './components/form/input/GenericFetchAutoComplete'
import Input from './components/form/input/Input'
import MaskInput from './components/form/input/MaskInput'
import GenericMaskInput from './components/form/input/GenericMaskInput'

import MultInput from './components/form/input/MultInput'
import GenericMultInput from './components/form/input/GenericMultInput'

import OtherCheckBox from './components/form/input/OtherCheckBox'

import Stepper from './components/form/stepper/Stepper'
import StepperBlock from './components/form/stepper/StepperBlock'

import Switch from './components/form/switch/Switch'
import { SwitchWatch, ToggleVisibility } from './components/form/switch/ToggleVisibility'

import Table from './components/form/table/Table'

import NavBar from './components/navbar/NavBar'
import TabNavBar from './components/navbar/TabNavBar'

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
import { MODAL } from './components/modal/Modal'
import { SspComponentsProvider } from './components/providers/SspComponentsProvider'

import Button from './components/utils/Bt'
import Menu from './components/utils/CustomMenu'

import GenericInput from './components/form/input/GenericInput'

export {
    CheckBox,
    CheckBoxWarning,
    DatePicker,
    GenericDatePicker,
    TimePicker,
    FileUpload,
    ActiveInput,
    AutoComplete,
    FetchAutoComplete,
    GenericFetchAutoComplete,
    Input,
    GenericInput,
    MaskInput,
    MultInput,
    GenericMultInput,
    GenericMaskInput,
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
    MODAL,
    SspComponentsProvider,
    TabNavBar,
    Button,
    Menu,
}

import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  Renderer2,
} from '@angular/core';
import { AmplifyBasePrimitiveComponent } from '../../base-primitive';

const $COMPONENT_SELECTOR: string = 'amplify-flex';

@Component({
  selector: $COMPONENT_SELECTOR,
  templateUrl: 'flex.component.html',
})
export class AmplifyFlexComponent {
  @Input() wrap: string;
  @Input() direction: string;
  @Input() alignContent: string;
  @Input() justifyContent: string;
  @Input() alignItems: string;
  @Input() gap: string;
}

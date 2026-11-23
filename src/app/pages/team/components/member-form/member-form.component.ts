import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MemberDraft } from '../../../../core/models/team.model';
import { notTaken, requiredText } from '../../../../shared/validators/form.validators';

@Component({
  selector: 'app-member-form',
  imports: [ReactiveFormsModule, TranslocoPipe, ButtonModule, InputTextModule],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  /** Emails already in the team, so the same person can't be added twice */
  readonly takenEmails = input<string[]>([]);
  readonly saving = input(false);

  readonly saved = output<MemberDraft>();
  readonly cancelled = output<void>();

  protected readonly form = this.formBuilder.group({
    name: ['', requiredText],
    email: ['', [Validators.required, Validators.email, notTaken(() => this.takenEmails())]],
  });

  protected showError(control: AbstractControl) {
    return control.invalid && control.touched;
  }

  protected submit() {
    // Enter in a field submits even while the button is disabled
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email } = this.form.getRawValue();
    this.saved.emit({ name: name.trim(), email: email.trim() });
  }
}

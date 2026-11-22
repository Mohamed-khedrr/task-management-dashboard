import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { TaskFiltersService } from '../../core/services/task-filters.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
  });

  it('emits menuToggle when the menu button is clicked', () => {
    const onMenuToggle = vi.fn();
    fixture.componentInstance.menuToggle.subscribe(onMenuToggle);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.menu-button')!
      .click();

    expect(onMenuToggle).toHaveBeenCalledOnce();
  });

  it('updates the search filter as the user types', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '.search-input',
    )!;

    input.value = 'report';
    input.dispatchEvent(new Event('input'));

    expect(TestBed.inject(TaskFiltersService).search()).toBe('report');
  });
});

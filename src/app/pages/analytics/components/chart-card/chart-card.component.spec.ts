import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartCardComponent } from './chart-card.component';

describe('ChartCardComponent', () => {
  let fixture: ComponentFixture<ChartCardComponent>;

  beforeEach(async () => {
    // jsdom can't draw on a canvas; the chart itself isn't under test
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('title', 'Tasks by status');
    fixture.componentRef.setInput('kind', 'doughnut');
    fixture.componentRef.setInput('items', [
      { label: 'To Do', count: 4, color: '#1976d2' },
      { label: 'Done', count: 9, color: '#388e3c' },
    ]);
    await fixture.whenStable();
  });

  it('describes every value for screen readers', () => {
    const canvas = (fixture.nativeElement as HTMLElement).querySelector('canvas')!;

    expect(canvas.getAttribute('aria-label')).toBe('To Do: 4, Done: 9');
  });
});

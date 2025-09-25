import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerminacionComponent } from './germinacion.component';

describe('GerminacionComponent', () => {
  let component: GerminacionComponent;
  let fixture: ComponentFixture<GerminacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerminacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerminacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

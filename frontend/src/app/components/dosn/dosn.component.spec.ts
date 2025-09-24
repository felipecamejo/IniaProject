import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DOSNComponent } from './dosn.component';

describe('DOSNComponent', () => {
  let component: DOSNComponent;
  let fixture: ComponentFixture<DOSNComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DOSNComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DOSNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

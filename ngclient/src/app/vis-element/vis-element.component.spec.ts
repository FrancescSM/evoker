import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisElementComponent } from './vis-element.component';

describe('VisElementComponent', () => {
  let component: VisElementComponent;
  let fixture: ComponentFixture<VisElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

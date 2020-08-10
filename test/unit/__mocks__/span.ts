/**
 * Mock Span
 */
class Span {
  public isFinished: boolean
  public constructor() {
    this.isFinished = false
  }

  public getChild() {
    return new Span()
  }

  public audit() {
    return jest.fn()
  }

  public error() {
    return jest.fn()
  }

  public finish() {
    return jest.fn()
  }
}

export default Span

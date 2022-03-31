/**
 * Mock Span
 */

class Span {
  public child: Span | undefined
  public isFinished: boolean
  public constructor() {
    this.isFinished = false
  }

  public getChild() {
    this.child = new Span()
    return this.child
  }

  public audit = jest.fn()
  public error = jest.fn()
  public finish = jest.fn()
}

export default Span

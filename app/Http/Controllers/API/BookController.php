<?php
   
namespace App\Http\Controllers\API;
   
use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use App\Models\Book;
use Validator;
use App\Http\Resources\BookResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
   
class BookController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(): JsonResponse
    {
        $books = Book::all();
    
        return $this->sendResponse(BookResource::collection($books), 'books retrieved successfully.');
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
   
        $validator = Validator::make($input, [
            'title' => 'required',
            'author' => 'required',
            'description' => 'nullable',
            'isbn' => 'nullable',
            'image' => 'nullable',
            'genres' => 'array', // Ensure genres is an array
            'genres.*' => 'exists:genres,id'
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }
   
        // no genres initially
        $book = Book::create($request->only(['title', 'author', 'description', 'isbn', 'image']));

        // attach genres if provided
        if ($request->has('genres')) {
            $book->genres()->attach($request->genres);
        }
    
        return $this->sendResponse(new BookResource($book->load('genres')), 'book created successfully.');
    } 
   
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id): JsonResponse
    {
        $book = Book::with('genres', 'reviews')->find($id);
  
        if (is_null($book)) {
            return $this->sendError('book not found.');
        }
   
        return $this->sendResponse(new BookResource($book), 'Book retrieved successfully.');
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Book $book): JsonResponse
    {
        $input = $request->all();
   
        $validator = Validator::make($input, [
            'title' => 'sometimes|string|',
            'author' => 'sometimes|string|',
            'description' => 'sometimes|string|',
            'isbn' => 'sometimes|string|',
            'image' => 'sometimes|string|',
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        // only update if field is required to do so
   
        if (isset($input['title'])) {
            $book->title = $input['title'];
        }
        if (isset($input['author'])) {
            $book->author = $input['author'];
        }
        if (isset($input['description'])) {
            $book->description = $input['description'];
        }
        if (isset($input['isbn'])) {
            $book->isbn = $input['isbn'];
        }
        if (isset($input['image'])) {
            $book->image = $input['image'];
        }    
        $book->save();
   
        return $this->sendResponse(new BookResource($book), 'book updated successfully.');
    }

    public function storeFromIsbn(Request $request)
    {
    $request->validate([
        'isbn' => 'required|string'
    ]);

    $isbn = $request->isbn;

    $existingBook = Book::where('isbn', $isbn)->first();

    if ($existingBook) {
        // if the book already exists, associate the authenticated user with the book
        $existingBook->users()->attach(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'This ISBN exists and you have been added as an owner.',
            'data' => new BookResource($existingBook->load('genres', 'users'))
        ], 200);
    }
    $response = Http::get("https://openlibrary.org/isbn/{$isbn}.json");

    if (!$response->ok()) {
        return response()->json(['message' => 'Book not found from OpenLibrary'], 404);
    }

    $data = $response->json();

    // author is required, so im setting name to be unknown should author key not appear 
    $authorName = 'Unknown';
        if (!empty($data['authors'][0]['key'])) {
            $authorKey = $data['authors'][0]['key'];
            $authorResponse = Http::get("https://openlibrary.org{$authorKey}.json");

        if ($authorResponse->ok() && isset($authorResponse['name'])) {
            $authorName = $authorResponse['name'];
    }
    }

    // dealing with returned descriptions having different formats
    $description = data_get($data, 'description.value') 
        ?? data_get($data, 'description') 
        ?? 'No description available';

    $subjects = $data['subjects'] ?? [];


    // Store each subject as a new genre if not already existing
    $genreIds = [];
    foreach ($subjects as $subject) {
        $genre = Genre::firstOrCreate(['name' => $subject]);
        $genreIds[] = $genre->id;
    }

    $coverUrl = "https://covers.openlibrary.org/b/isbn/{$isbn}-L.jpg";


    $book = Book::create([
        'title' => $data['title'] ?? 'Untitled',
        'author' => $authorName,
        'description' => $description,
        'isbn' => $isbn,
        'image' => $coverUrl,
    ]);
    $book->genres()->attach($genreIds);

    return response()->json([
        'success' => true,
        'data' => $book->load('genres'),
        'message' => 'Book added successfully from OpenLibrary'
    ]);
}
   
    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();
   
        return $this->sendResponse([], 'book deleted successfully.');
    }
}
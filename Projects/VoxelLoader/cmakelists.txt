cmake_minimum_required(VERSION 3.30.5)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)

if("${CMAKE_GENERATOR}" STREQUAL "Visual Studio 17 2022")
    message("Visual Studio Generator")
else()
    set(CMAKE_CXX_FLAGS "-Wall -Wextra")
endif()
add_compile_options("$<$<COMPILE_LANGUAGE:CXX>:-O3;-ffast-math>")

# Change this to match the name of the current folder
project(VoxelLoader LANGUAGES CXX C VERSION 2.0)
option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

message("Build type: ${CMAKE_BUILD_TYPE}")

set(RAYLIB_VERSION 5.5)
find_package(raylib ${RAYLIB_VERSION} QUIET) # QUIET or REQUIRED
if (NOT raylib_FOUND) # If there's none, fetch and build raylib
    include(FetchContent)
    FetchContent_Declare(
        raylib
        DOWNLOAD_EXTRACT_TIMESTAMP OFF
        URL
        https://github.com/raysan5/raylib/archive/refs/tags/${RAYLIB_VERSION}.tar.gz
  )
  FetchContent_GetProperties(raylib)
    if (NOT raylib_POPULATED)
        set(FETCHCONTENT_QUIET NO)
        FetchContent_MakeAvailable(raylib)
        set(BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
    endif()
endif()

file(GLOB_RECURSE MY_SOURCES CONFIGURE_DEPENDS
    "${CMAKE_CURRENT_SOURCE_DIR}/Src/*.cpp"
)

add_executable("${CMAKE_PROJECT_NAME}") 
if(EMSCRIPTEN)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS}\
 --shell-file ${CMAKE_CURRENT_SOURCE_DIR}/Src/template.html\
 -sALLOW_MEMORY_GROWTH=1"
    )
    file(GLOB_RECURSE MODELS CONFIGURE_DEPENDS
        "${CMAKE_CURRENT_SOURCE_DIR}/Resources/*.vox"
    )
    foreach(MODEL ${MODELS})
        get_filename_component(TRIMMED ${MODEL} NAME)
        set_target_properties(
            ${CMAKE_PROJECT_NAME} PROPERTIES LINK_FLAGS
            "--preload-file ../Resources/${TRIMMED}@./Resources/${TRIMMED}"
        )
    endforeach()
    set(CMAKE_EXECUTABLE_SUFFIX ".html")
    set_target_properties(
        ${CMAKE_PROJECT_NAME} PROPERTIES LINK_FLAGS
        "--preload-file ../Resources@./Resources"
    )
endif()
target_compile_definitions(
    ${CMAKE_PROJECT_NAME}
    PUBLIC
    $<$<CONFIG:Release>:PRODUCTION_BUILD>
    NAME="${CMAKE_PROJECT_NAME}"
)

set_target_properties(
    "${CMAKE_PROJECT_NAME}" PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY_DEBUG
    "${CMAKE_CURRENT_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE
    "${CMAKE_CURRENT_SOURCE_DIR}/bin/\
${CMAKE_PROJECT_NAME}_${CMAKE_PROJECT_VERSION}"
)
if(EMSCRIPTEN)
    set_target_properties(
        ${CMAKE_PROJECT_NAME} PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY_RELEASE
        "${CMAKE_CURRENT_SOURCE_DIR}/bin/\
${CMAKE_PROJECT_NAME}_${CMAKE_PROJECT_VERSION}_web"
    )
endif()

set(RELEASE_RESOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/bin/\
${CMAKE_PROJECT_NAME}_${CMAKE_PROJECT_VERSION}/Resources/"
)
set(DEBUG_RESOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/Resources/")
target_compile_definitions(
    ${CMAKE_PROJECT_NAME}
    PUBLIC
    RESOURCES_PATH=$<IF:$<CONFIG:Release>,"./Resources/","${DEBUG_RESOURCE_DIR}">
)

target_compile_features("${CMAKE_PROJECT_NAME}" PRIVATE cxx_std_20)

target_sources("${CMAKE_PROJECT_NAME}" PRIVATE ${MY_SOURCES} )

target_link_libraries(${PROJECT_NAME} raylib)

target_include_directories(
    "${CMAKE_PROJECT_NAME}" PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/Include/"
)
target_include_directories(
    "${CMAKE_PROJECT_NAME}" PUBLIC "${PROJECT_BINARY_DIR}"
)

if(NOT EMSCRIPTEN)
    add_custom_command(
        TARGET ${CMAKE_PROJECT_NAME}
        POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/Resources"
        $<IF:$<CONFIG:Release>,"${RELEASE_RESOURCE_DIR}","${DEBUG_RESOURCE_DIR}">
    )
endif()
